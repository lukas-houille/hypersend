# Hypersend Client Service

This service is responsible for managing client-related operations in the Hypersend application. It handles client orders and keep the client updated with Server-Sent Events.

This service sent the order on the following rabbitMQ queue:
`client.order.new`

then the service will listen to the following rabbitMQ queues:
`order.client.paiment`
`restaurant.client.status`
`driver.client.status`
