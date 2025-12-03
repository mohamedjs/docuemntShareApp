<?php

namespace Modules\Document\App\Events;

use App\Models\Document;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DocumentUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $document;
    public $userId;

    public function __construct(Document $document, int $userId)
    {
        $this->document = $document;
        $this->userId = $userId;
    }

    public function broadcastOn()
    {
        return new Channel('document.' . $this->document->id);
    }

    public function broadcastAs()
    {
        return 'document.updated';
    }

    public function broadcastWith()
    {
        return [
            'document' => $this->document,
            'user_id' => $this->userId,
            'timestamp' => now()->toIso8601String(),
        ];
    }
}
