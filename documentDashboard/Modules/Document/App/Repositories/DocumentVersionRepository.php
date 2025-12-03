<?php

namespace Modules\Document\App\Repositories;

use App\Models\DocumentVersion;

class DocumentVersionRepository
{
    public function create(array $data)
    {
        return DocumentVersion::create($data);
    }

    public function findByDocumentId(int $documentId)
    {
        return DocumentVersion::where('document_id', $documentId)
            ->with('user')
            ->orderBy('version_number', 'desc')
            ->get();
    }

    public function findById(int $id)
    {
        return DocumentVersion::find($id);
    }

    public function getNextVersionNumber(int $documentId)
    {
        $lastVersion = DocumentVersion::where('document_id', $documentId)
            ->orderBy('version_number', 'desc')
            ->first();

        return $lastVersion ? $lastVersion->version_number + 1 : 1;
    }
}
