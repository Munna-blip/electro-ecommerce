import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import api from "../api/axios";
import { formatCurrency } from "../utils/format";
import LoadingSpinner from "../components/LoadingSpinner";
import { FaPrint } from "react-icons/fa";

export default function OrderDetails() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const paymentResult = searchParams.get("payment");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${id}`).then((res) => setOrder(res.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!order) return <div className="container py-5 text-center">Order not found.</div>;

  return (
    <div className="container py-4" style={{ maxWidth: 800 }}>
      {paymentResult === "success" && (
        <div className="alert alert-success">Payment completed successfully!</div>
      )}
      {paymentResult === "failed" && (
        <div className="alert alert-danger">Payment failed or was cancelled. You can retry payment or contact support.</div>
      )}

      <div className="d-flex justify-content-end mb-2 d-print-none">
        <button className="btn btn-primary" onClick={() => window.print()}>
          <FaPrint className="me-2" />Print Invoice
        </button>
      </div>

      <div className="card shadow-sm" id="invoice-print">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h3 className="text-primary fw-bold mb-0">ELECTRO</h3>
              <div className="text-muted small">House 12, Road 5, Dhaka, Bangladesh</div>
              <div className="text-muted small">+880 9666-777-999</div>
            </div>
            <div className="text-end">
              <h5 className="mb-0">INVOICE</h5>
              {order.invoice && <div className="text-muted small">{order.invoice.invoice_no}</div>}
              <div className="text-muted small">{new Date(order.created_at).toLocaleString()}</div>
            </div>
          </div>

          <hr />

          <div className="row mb-3">
            <div className="col-md-6">
              <h6>Billed To</h6>
              <p className="mb-0 small">
                {order.shipping_name || order.user?.name}<br />
                {order.shipping_phone || order.user?.phone}<br />
                {order.shipping_address || order.user?.address}
              </p>
            </div>
            <div className="col-md-6 text-md-end">
              <h6>Order Info</h6>
              <div className="small">Order No: {order.order_no}</div>
              <div className="small text-capitalize">Status: {order.status}</div>
              <div className="small text-capitalize">Payment: {order.payment_status}</div>
            </div>
          </div>

          <table className="table">
            <thead><tr><th>Product</th><th>Qty</th><th>Price</th><th className="text-end">Subtotal</th></tr></thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.product_name}</td>
                  <td>{item.quantity}</td>
                  <td>{formatCurrency(item.unit_price)}</td>
                  <td className="text-end">{formatCurrency(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="d-flex justify-content-end">
            <div style={{ width: 260 }}>
              <div className="d-flex justify-content-between"><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
              <div className="d-flex justify-content-between"><span>Tax</span><span>{formatCurrency(order.tax)}</span></div>
              <div className="d-flex justify-content-between"><span>Discount</span><span>-{formatCurrency(order.discount)}</span></div>
              <div className="d-flex justify-content-between"><span>Shipping</span><span>{formatCurrency(order.shipping_fee)}</span></div>
              <hr />
              <div className="d-flex justify-content-between fw-bold fs-5"><span>Total</span><span>{formatCurrency(order.total)}</span></div>
            </div>
          </div>

          <hr />
          <p className="text-center text-muted small mb-0">Thank you for shopping with Electro!</p>
        </div>
      </div>
    </div>
  );
}