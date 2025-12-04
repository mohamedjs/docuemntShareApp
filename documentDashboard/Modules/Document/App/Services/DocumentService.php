<?php

namespace Modules\Document\App\Services;

use Modules\Document\App\Repositories\DocumentRepository;
use Modules\Document\App\Repositories\DocumentVersionRepository;
use Modules\Document\App\Events\DocumentUpdated;
use Illuminate\Support\Facades\DB;

class DocumentService
{
    protected $documentRepository;
    protected $versionRepository;

    public function __construct(
        DocumentRepository $documentRepository,
        DocumentVersionRepository $versionRepository
    ) {
        $this->documentRepository = $documentRepository;
        $this->versionRepository = $versionRepository;
    }

    public function create(array $data, int $userId)
    {
        $data['user_id'] = $userId;
        $document = $this->documentRepository->create($data);

        // Create initial version
        $this->createVersion($document->id, $data['content'] ?? '', $userId);

        return $document;
    }

    public function update(int $id, array $data, int $userId)
    {
        return DB::transaction(function () use ($id, $data, $userId) {
            $document = $this->documentRepository->update($id, $data);

            if ($document && isset($data['content'])) {
                // Create new version
                $this->createVersion($id, $data['content'], $userId);

                // Broadcast update event
                broadcast(new DocumentUpdated($document, $userId))->toOthers();
            }

            return $document;
        });
    }

    public function delete(int $id, int $userId)
    {
        $document = $this->documentRepository->findById($id);

        if (!$document || $document->user_id !== $userId) {
            return false;
        }

        return $this->documentRepository->delete($id);
    }

    public function getAll(int $userId)
    {
        return $this->documentRepository->findByUserId($userId);
    }

    public function getById(int $id, int $userId)
    {
        $document = $this->documentRepository->findById($id);

        if (!$document) {
            return null;
        }

        // Check if user has access (owner or collaborator)
        $hasAccess = $document->user_id === $userId ||
                    $document->collaborators->contains('id', $userId);

        return $hasAccess ? $document : null;
    }

    public function addCollaborator(int $documentId, int $collaboratorId, int $userId)
    {
        $document = $this->documentRepository->findById($documentId);

        if (!$document || $document->user_id !== $userId) {
            return false;
        }

        return $this->documentRepository->addCollaborator($documentId, $collaboratorId);
    }

    public function removeCollaborator(int $documentId, int $collaboratorId, int $userId)
    {
        $document = $this->documentRepository->findById($documentId);

        if (!$document || $document->user_id !== $userId) {
            return false;
        }

        return $this->documentRepository->removeCollaborator($documentId, $collaboratorId);
    }

    protected function createVersion(int $documentId, string $content, int $userId)
    {
        $versionNumber = $this->versionRepository->getNextVersionNumber($documentId);

        return $this->versionRepository->create([
            'document_id' => $documentId,
            'content' => $content,
            'user_id' => $userId,
            'version_number' => $versionNumber,
            'created_at' => now(),
        ]);
    }

    public function getVersions(int $documentId, int $userId)
    {
        $document = $this->getById($documentId, $userId);

        if (!$document) {
            return null;
        }

        return $this->versionRepository->findByDocumentId($documentId);
    }

    public function restoreVersion(int $versionId, int $userId)
    {
        $version = $this->versionRepository->findById($versionId);

        if (!$version) {
            return null;
        }

        $document = $this->getById($version->document_id, $userId);

        if (!$document) {
            return null;
        }

        return $this->update($version->document_id, [
            'content' => $version->content
        ], $userId);
    }

    public function generateShareLink(int $documentId, int $userId, string $permission = 'edit', $expiresInDays = null)
    {
        $document = $this->documentRepository->findById($documentId);

        if (!$document || $document->user_id !== $userId) {
            return null;
        }

        $token = $document->generateShareToken();
        $expiresAt = $expiresInDays ? now()->addDays($expiresInDays) : null;

        $this->documentRepository->update($documentId, [
            'share_token' => $token,
            'is_share_enabled' => true,
            'share_permission' => $permission,
            'share_expires_at' => $expiresAt,
        ]);

        return $token;
    }

    public function revokeShareLink(int $documentId, int $userId)
    {
        $document = $this->documentRepository->findById($documentId);

        if (!$document || $document->user_id !== $userId) {
            return false;
        }

        $this->documentRepository->update($documentId, [
            'is_share_enabled' => false,
        ]);

        return true;
    }

    public function getByShareToken(string $token)
    {
        $document = $this->documentRepository->findByShareToken($token);

        if (!$document || !$document->isShareValid()) {
            return null;
        }

        return $document;
    }

    public function updateByShareToken(string $token, array $data)
    {
        $document = $this->documentRepository->findByShareToken($token);

        if (!$document || !$document->isShareValid()) {
            return null;
        }

        // Check if user has edit permission
        if ($document->share_permission !== 'edit') {
            return null;
        }

        return DB::transaction(function () use ($document, $data) {
            $updated = $this->documentRepository->update($document->id, $data);

            if ($updated && isset($data['content'])) {
                // Create new version (use document owner as user_id for shared updates)
                $this->createVersion($document->id, $data['content'], $document->user_id);

                // Broadcast update event to all connected users
                broadcast(new DocumentUpdated($updated, $document->user_id))->toOthers();
            }

            return $updated;
        });
    }
}
