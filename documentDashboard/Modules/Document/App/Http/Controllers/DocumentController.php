<?php

namespace Modules\Document\App\Http\Controllers;

use App\Http\Controllers\Controller;
use Modules\Document\App\Services\DocumentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class DocumentController extends Controller
{
    protected $documentService;

    public function __construct(DocumentService $documentService)
    {
        $this->documentService = $documentService;
        $this->middleware('auth:api');
    }

    public function index(Request $request)
    {
        $documents = $this->documentService->getAll(auth()->id());
        return response()->json($documents);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'content' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $document = $this->documentService->create($request->all(), auth()->id());

        return response()->json([
            'message' => 'Document created successfully',
            'document' => $document
        ], 201);
    }

    public function show($id)
    {
        $document = $this->documentService->getById($id, auth()->id());

        if (!$document) {
            return response()->json(['error' => 'Document not found or access denied'], 404);
        }

        return response()->json($document);
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'content' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $document = $this->documentService->update($id, $request->all(), auth()->id());

        if (!$document) {
            return response()->json(['error' => 'Document not found or access denied'], 404);
        }

        return response()->json([
            'message' => 'Document updated successfully',
            'document' => $document
        ]);
    }

    public function destroy($id)
    {
        $result = $this->documentService->delete($id, auth()->id());

        if (!$result) {
            return response()->json(['error' => 'Document not found or access denied'], 404);
        }

        return response()->json(['message' => 'Document deleted successfully']);
    }

    public function addCollaborator(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|integer|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $result = $this->documentService->addCollaborator($id, $request->user_id, auth()->id());

        if (!$result) {
            return response()->json(['error' => 'Failed to add collaborator'], 400);
        }

        return response()->json(['message' => 'Collaborator added successfully']);
    }

    public function removeCollaborator($id, $userId)
    {
        $result = $this->documentService->removeCollaborator($id, $userId, auth()->id());

        if (!$result) {
            return response()->json(['error' => 'Failed to remove collaborator'], 400);
        }

        return response()->json(['message' => 'Collaborator removed successfully']);
    }

    public function versions($id)
    {
        $versions = $this->documentService->getVersions($id, auth()->id());

        if ($versions === null) {
            return response()->json(['error' => 'Document not found or access denied'], 404);
        }

        return response()->json($versions);
    }

    public function restoreVersion($id, $versionId)
    {
        $document = $this->documentService->restoreVersion($versionId, auth()->id());

        if (!$document) {
            return response()->json(['error' => 'Version not found or access denied'], 404);
        }

        return response()->json([
            'message' => 'Version restored successfully',
            'document' => $document
        ]);
    }

    public function generateShareLink(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'permission' => 'sometimes|in:view,edit',
            'expires_in_days' => 'sometimes|integer|min:1|max:365',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $permission = $request->input('permission', 'edit');
        $expiresInDays = $request->input('expires_in_days');

        $token = $this->documentService->generateShareLink($id, auth()->id(), $permission, $expiresInDays);

        if (!$token) {
            return response()->json(['error' => 'Failed to generate share link'], 400);
        }

        $shareUrl = url("/share/{$token}");

        return response()->json([
            'message' => 'Share link generated successfully',
            'share_token' => $token,
            'share_url' => $shareUrl,
            'permission' => $permission,
            'expires_in_days' => $expiresInDays
        ]);
    }

    public function revokeShareLink($id)
    {
        $result = $this->documentService->revokeShareLink($id, auth()->id());

        if (!$result) {
            return response()->json(['error' => 'Failed to revoke share link'], 400);
        }

        return response()->json(['message' => 'Share link revoked successfully']);
    }

    public function getByShareToken($token)
    {
        $document = $this->documentService->getByShareToken($token);

        if (!$document) {
            return response()->json(['error' => 'Invalid or expired share link'], 404);
        }

        return response()->json($document);
    }

    public function updateByShareToken(Request $request, $token)
    {
        $validator = Validator::make($request->all(), [
            'content' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $document = $this->documentService->updateByShareToken($token, $request->only('content'));

        if (!$document) {
            return response()->json(['error' => 'Invalid or expired share link, or you don\'t have edit permission'], 403);
        }

        return response()->json([
            'message' => 'Document updated successfully',
            'document' => $document
        ]);
    }
}
