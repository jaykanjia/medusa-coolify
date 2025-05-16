export function generateOrderEmailTemplate(data) {
  const {
    customerFirstName,
    id,
    createdAt,
    items,
    billingAddress,
    shippingAddress,
  } = data;

  return `<!DOCTYPE html>
  <html>
  <head>
    <title>Order Confirmation</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .container {
            width: 80%;
            margin: 0 auto;
        }
        .header {
            text-align: center;
            padding: 20px 0;
        }
        .content {
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 0.9em;
            color: #888;
        }
        .order-details {
            border-collapse: collapse;
            width: 100%;
            margin: 20px 0;
        }
        .order-details th, .order-details td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        .order-details th {
            background-color: #f4f4f4;
        }
    </style>
  </head>
  <body>
    <div class="container">
        <div class="header">
            <h1>Thank You for Your Order, ${customerFirstName}!</h1>
        </div>
  
        <div class="content">
            <p>We have received your order <strong>#${id}</strong> placed on <strong>${createdAt}</strong>.</p>
            <h3>Order Summary:</h3>
  
            <table class="order-details">
                <tr>
                    <th>Item</th>
                    <th>Description</th>
                    <th>Quantity</th>
                    <th>Price</th>
                </tr>
                ${items
                  .map(
                    (item) => `
                <tr>
                    <td>${item.product_title}</td>
                    <td>${item.subtitle}</td>
                    <td>${item.quantity}</td>
                    <td>${item.unit_price}</td>
                </tr>
                `
                  )
                  .join("")}
            </table>
  
            <h3>Billing Address:</h3>
            <p>
                ${billingAddress.first_name} ${billingAddress.last_name}<br>
                ${billingAddress.address_1}<br>
                ${billingAddress.city}, ${billingAddress.country_code} - ${
    billingAddress.postal_code
  }<br>
                Phone: ${billingAddress.phone}
            </p>
  
            <h3>Shipping Address:</h3>
            <p>
                ${shippingAddress.first_name} ${shippingAddress.last_name}<br>
                ${shippingAddress.address_1}<br>
                ${shippingAddress.city}, ${shippingAddress.country_code} - ${
    shippingAddress.postal_code
  }<br>
                Phone: ${shippingAddress.phone}
            </p>
        </div>
  
        <div class="footer">
            <p>&copy; 2024 Gift.mu All rights reserved.</p>
        </div>
    </div>
  </body>
  </html>`;
}
