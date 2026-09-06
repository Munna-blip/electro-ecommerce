<?php
namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class OrderStatusUpdatedMail extends Mailable
{
    use Queueable, SerializesModels;

    public Order $order;

    public function __construct(Order $order)
    {
        $this->order = $order->load("items");
    }

    public function build()
    {
        return $this->subject("Order Update — {$this->order->order_no} is now {$this->order->status}")
            ->view("emails.order-status-updated");
    }
}