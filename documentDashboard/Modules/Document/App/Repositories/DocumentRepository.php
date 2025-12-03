<?php

namespace Modules\Document\App\Repositories;

use App\Models\Document;

class DocumentRepository
{
    public function create(array $data)
    {
        return Document::create($data);
    }

    public function findById(int $id)
    {
        return Document::with(['user', 'collaborators', 'versions'])->find($id);
    }

    public function findByUserId(int $userId)
    {
        return Document::where('user_id', $userId)
            ->orWhereHas('collaborators', function ($query) use ($userId) {
                $query->where('user_id', $userId);
            })
            ->with(['user', 'collaborators'])
            ->orderBy('updated_at', 'desc')
            ->get();
    }

    public function update(int $id, array $data)
    {
        $document = Document::find($id);
        if ($document) {
            $document->update($data);
            return $document;
        }
        return null;
    }

    public function delete(int $id)
    {
        $document = Document::find($id);
        if ($document) {
            return $document->delete();
        }
        return false;
    }

    public function addCollaborator(int $documentId, int $userId)
    {
        $document = Document::find($documentId);
        if ($document && !$document->collaborators()->where('user_id', $userId)->exists()) {
            $document->collaborators()->attach($userId);
            return true;
        }
        return false;
    }

    public function removeCollaborator(int $documentId, int $userId)
    {
        $document = Document::find($documentId);
        if ($document) {
            $document->collaborators()->detach($userId);
            return true;
        }
        return false;
    }

    public function findByShareToken(string $token)
    {
        return Document::where('share_token', $token)
            ->with(['user', 'collaborators', 'versions'])
            ->first();
    }
}
