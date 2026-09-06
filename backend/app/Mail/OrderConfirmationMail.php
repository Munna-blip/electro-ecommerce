<?php
namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class OrderConfirmationMail extends Mailable
{
    use Queueable, SerializesModels;

    public Order $order;

    public function __construct(Order $order)
    {
        $this->order = $order->load("items");
    }

    public function build()
    {
        return $this->subject("Order Confirmed — {$this->order->order_no}")
            ->view("emails.order-confirmation");
    }
}