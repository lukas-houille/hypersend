-- Create users for each service
CREATE USER authservice WITH PASSWORD 'password';
CREATE USER clientservice WITH PASSWORD 'password';
CREATE USER driverservice WITH PASSWORD 'password';
CREATE USER restaurantservice WITH PASSWORD 'password';
CREATE USER orderservice WITH PASSWORD 'password';

-- Grant privileges to the users
-- The public schema is owned by postgres user. To allow other users to create tables, we need to grant them usage on the schema.
GRANT USAGE, CREATE ON SCHEMA public TO authservice;
GRANT USAGE, CREATE ON SCHEMA public TO clientservice;
GRANT USAGE, CREATE ON SCHEMA public TO driverservice;
GRANT USAGE, CREATE ON SCHEMA public TO restaurantservice;
GRANT USAGE, CREATE ON SCHEMA public TO orderservice;

-- Create the necessary tables for the services

create table addresses
(
    address_id   bigint not null,
    address_line varchar(255),
    city         varchar(100),
    state        varchar(100),
    postal_code  varchar(20),
    country      varchar(100),
    primary key (address_id)
);

create table restaurant_type
(
    restaurant_type_id   bigint not null,
    restaurant_type_name varchar(100),
    primary key (restaurant_type_id)
);

create table item_type
(
    item_type_id   bigint       not null,
    item_type_name varchar(100) not null,
    primary key (item_type_id)
);

create table vehicle_types
(
    vehicle_type_id   bigint not null,
    vehicle_type_name varchar(50),
    primary key (vehicle_type_id)
);

create table clients
(
    client_id     bigint generated always as identity,
    email         varchar(255)                        not null,
    password_hash varchar(255)                        not null,
    first_name    varchar(100),
    last_name     varchar(100),
    date_of_birth date,
    phone_number  varchar(20),
    address_id    bigint,
    registered_at timestamp default CURRENT_TIMESTAMP not null,
    primary key (client_id),
    unique (email),
    foreign key (address_id) references addresses
);

create table drivers
(
    driver_id      bigint generated always as identity,
    email          varchar(255) not null,
    password_hash  varchar(255) not null,
    first_name     varchar(100),
    last_name      varchar(100),
    date_of_birth  date,
    phone_number   varchar(15),
    driver_license varchar(100),
    rating         varchar(3) default 0.0,
    address_id     bigint,
    registered_at  timestamp  default CURRENT_TIMESTAMP,
    primary key (driver_id),
    unique (email),
    foreign key (address_id) references addresses
);

create table vehicles
(
    vehicle_id      bigint      not null,
    driver_id       bigint,
    license_plate   varchar(50) not null,
    vehicle_type    bigint,
    brand           varchar(100),
    model           varchar(100),
    color           varchar(50),
    production_year integer,
    registered_at   timestamp default CURRENT_TIMESTAMP,
    primary key (vehicle_id),
    foreign key (driver_id) references drivers,
    foreign key (vehicle_type) references vehicle_types
);

create table restaurants
(
    restaurant_id bigint       not null,
    name          varchar(255) not null,
    email         varchar(255) not null,
    password_hash varchar(255) not null,
    phone_number  varchar(20)  not null,
    type          bigint,
    address_id    bigint,
    opening_hours text,
    opening_days  text,
    rating        numeric(2, 1) default 0.0,
    created_at    timestamp     default CURRENT_TIMESTAMP,
    img_url       varchar,
    description   text,
    primary key (restaurant_id),
    unique (email),
    foreign key (type) references restaurant_type,
    foreign key (address_id) references addresses
);

create table items
(
    item_id       bigint                 not null,
    restaurant_id bigint,
    name          varchar(255)           not null,
    type          bigint,
    price         numeric(10, 2)         not null,
    description   text,
    created_at    timestamp default CURRENT_TIMESTAMP,
    available     boolean   default true not null,
    img_url       varchar,
    primary key (item_id),
    foreign key (restaurant_id) references restaurants,
    foreign key (type) references item_type,
    constraint items_price_check
        check (price >= (0)::numeric)
    );

create table orders
(
    order_id                 bigint generated always as identity,
    client_id                bigint,
    driver_id                bigint,
    pickup_address_id        bigint,
    delivery_address_id      bigint,
    accepted_at              timestamp,
    picked_up_at             timestamp,
    delivered_at             timestamp,
    created_at               timestamp default CURRENT_TIMESTAMP,
    client_rating_driver     numeric(2, 1),
    client_rating_restaurant numeric(2, 1),
    special_request          text,
    restaurant_id            bigint,
    canceled_by              varchar(100),
    total_price              numeric(10, 2),
    ready_at                 timestamp,
    primary key (order_id),
    foreign key (client_id) references clients,
    foreign key (driver_id) references drivers,
    foreign key (pickup_address_id) references addresses,
    foreign key (delivery_address_id) references addresses,
    constraint orders_restaurants_id_fkey
        foreign key (restaurant_id) references restaurants
);

create table order_items
(
    order_item_id      bigint generated always as identity,
    order_id           bigint,
    restaurant_item_id bigint,
    quantity           integer default 1 not null,
    special_request    text,
    primary key (order_item_id),
    foreign key (order_id) references orders,
    constraint order_items_restaurant_menu_item_id_fkey
        foreign key (restaurant_item_id) references items
);

create table payments
(
    payment_id            bigint         not null,
    order_id              bigint,
    amount                numeric(10, 2) not null,
    driver_commission     numeric(10, 2) not null,
    restaurant_commission numeric(10, 2) not null,
    tip                   numeric(10, 2) default 0,
    paid_at               timestamp      default CURRENT_TIMESTAMP,
    discount_applied      numeric(10, 2) default 0,
    primary key (payment_id),
    foreign key (order_id) references orders
);

-- Since the services will create their own tables, we need to grant the permissions after the tables are created.
-- This can be done by altering the default privileges.
-- For any new table created by a service user, the other users will have the specified privileges.

-- auth-service: Manages user creation and authentication.
ALTER DEFAULT PRIVILEGES FOR ROLE authservice IN SCHEMA public GRANT SELECT, INSERT, UPDATE ON TABLES TO authservice;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authservice;


-- client-service: Manages client profiles and interactions.
ALTER DEFAULT PRIVILEGES FOR ROLE clientservice IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO clientservice;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO clientservice;

-- driver-service: Manages driver profiles and interactions.
ALTER DEFAULT PRIVILEGES FOR ROLE driverservice IN SCHEMA public GRANT SELECT, UPDATE ON TABLES TO driverservice;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO driverservice;

-- restaurant-service: Manages restaurant profiles, menus, and items.
ALTER DEFAULT PRIVILEGES FOR ROLE restaurantservice IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO restaurantservice;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO restaurantservice;

-- order-service: Manages orders, requiring access to various tables to assemble order details.
ALTER DEFAULT PRIVILEGES FOR ROLE orderservice IN SCHEMA public GRANT SELECT, INSERT, UPDATE ON TABLES TO orderservice;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO orderservice;
GRANT INSERT, UPDATE ON TABLE orders TO orderservice;
GRANT USAGE ON SEQUENCE orders_order_id_seq TO orderservice;
GRANT INSERT ON TABLE order_items TO orderservice;
GRANT USAGE ON SEQUENCE order_items_order_item_id_seq TO orderservice;

INSERT INTO public.addresses (address_id, address_line, city, state, postal_code, country) VALUES (1, '123 Main St', 'New York', 'NY', '10001', 'USA');
INSERT INTO public.addresses (address_id, address_line, city, state, postal_code, country) VALUES (2, '456 Elm St', 'Los Angeles', 'CA', '90001', 'USA');
INSERT INTO public.addresses (address_id, address_line, city, state, postal_code, country) VALUES (3, '789 Oak Ave', 'Chicago', 'IL', '60601', 'USA');
INSERT INTO public.addresses (address_id, address_line, city, state, postal_code, country) VALUES (4, '101 Maple Rd', 'Houston', 'TX', '77001', 'USA');
INSERT INTO public.addresses (address_id, address_line, city, state, postal_code, country) VALUES (5, '202 Pine Blvd', 'Phoenix', 'AZ', '85001', 'USA');

INSERT INTO public.clients (email, password_hash, first_name, last_name, date_of_birth, phone_number, address_id, registered_at) VALUES ('hello@mail.com', '$2b$10$XN4euaMUctQuO4HfmVFNU.kJgFE98c.6eTGKSWknKuqTOFYuYUUgu', null, null, null, null, null, '2025-06-19 14:29:16.022000');
INSERT INTO public.clients (email, password_hash, first_name, last_name, date_of_birth, phone_number, address_id, registered_at) VALUES ('hello2@mail.com', '$2b$10$GtzobA5Btxr6CV4kO/Y7IuW5kcNElBZZ2Ahv3ZHKFON.2r6EBybGG', null, null, null, null, null, '2025-06-20 16:25:26.828000');
INSERT INTO public.clients (email, password_hash, first_name, last_name, date_of_birth, phone_number, address_id, registered_at) VALUES ('hello3@mail.com', '$2b$10$w7Fc.UoVisSDVgZiE7UnoelAhQ/.vXNJs81WyhM5mdlxD1Bil8DG2', null, null, null, null, null, '2025-06-26 09:06:24.207556');

INSERT INTO public.drivers (email, password_hash, first_name, last_name, date_of_birth, phone_number, driver_license, rating, address_id, registered_at) VALUES ('hello@mail.com', '$2b$10$GZQ89z8V9k0Xtx.rg0vbNeDSnU2B0vU4qehmd.U3gy17ZsLk3ebbC', null, null, null, null, null, '0.0', null, '2025-06-20 09:31:14.129000');
INSERT INTO public.drivers (email, password_hash, first_name, last_name, date_of_birth, phone_number, driver_license, rating, address_id, registered_at) VALUES ('hello3@mail.com', '$2b$10$mmJ1uTlET8AIgamXNrdQc.n00SBciZDJ6BFfNTxHz3cgsy/Q/4lui', null, null, null, null, null, '0.0', null, '2025-06-26 09:06:35.606550');

INSERT INTO public.item_type (item_type_id, item_type_name) VALUES (1, 'Burger');
INSERT INTO public.item_type (item_type_id, item_type_name) VALUES (2, 'Pizza');
INSERT INTO public.item_type (item_type_id, item_type_name) VALUES (3, 'Beverage');
INSERT INTO public.item_type (item_type_id, item_type_name) VALUES (4, 'Dessert');
INSERT INTO public.item_type (item_type_id, item_type_name) VALUES (5, 'Salad');

INSERT INTO public.restaurant_type (restaurant_type_id, restaurant_type_name) VALUES (1, 'Fast Food');
INSERT INTO public.restaurant_type (restaurant_type_id, restaurant_type_name) VALUES (2, 'Fine Dining');
INSERT INTO public.restaurant_type (restaurant_type_id, restaurant_type_name) VALUES (3, 'Cafe');
INSERT INTO public.restaurant_type (restaurant_type_id, restaurant_type_name) VALUES (4, 'Casual Dining');
INSERT INTO public.restaurant_type (restaurant_type_id, restaurant_type_name) VALUES (5, 'Food Truck');

INSERT INTO public.restaurants (restaurant_id, name, email, password_hash, phone_number, type, address_id, opening_hours, opening_days, rating, created_at, img_url, description) VALUES (2, 'Cafe Delight', 'cafe@delight.com', 'hashed_r2', '555-5555', 3, 4, '08:00-20:00', 'Mon-Fri', 4.2, '2025-07-04 12:57:33.576277', '', null);
INSERT INTO public.restaurants (restaurant_id, name, email, password_hash, phone_number, type, address_id, opening_hours, opening_days, rating, created_at, img_url, description) VALUES (1, 'Burger Palace', 'burger@palace.com', 'hashed_r1', '555-4444', 1, 5, '10:00-22:00', 'Mon-Sun', 4.5, '2025-07-04 12:57:33.576277', '', null);

INSERT INTO public.items (item_id, restaurant_id, name, type, price, description, created_at, available, img_url) VALUES (1, 1, 'Cheeseburger', 1, 8.99, 'Grilled beef patty with cheese', '2025-07-04 12:57:33.587371', true, null);
INSERT INTO public.items (item_id, restaurant_id, name, type, price, description, created_at, available, img_url) VALUES (2, 1, 'Veggie Burger', 1, 7.49, 'Plant-based patty with lettuce and tomato', '2025-07-04 12:57:33.587371', false, null);
INSERT INTO public.items (item_id, restaurant_id, name, type, price, description, created_at, available, img_url) VALUES (3, 2, 'Cappuccino', 3, 3.99, 'Espresso with steamed milk foam', '2025-07-04 12:57:33.587371', true, null);
INSERT INTO public.items (item_id, restaurant_id, name, type, price, description, created_at, available, img_url) VALUES (4, 2, 'Blueberry Muffin', 4, 2.99, 'Freshly baked with real blueberries', '2025-07-04 12:57:33.587371', true, null);

INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, null, null, null, null, null, null, '2025-07-04 15:51:42.911434', null, null, null, 1, null, 8.99, null);
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, null, null, null, null, null, null, '2025-07-06 16:07:22.670091', null, null, null, 1, null, 26.97, null);
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, null, null, null, null, null, null, '2025-07-06 16:13:44.767221', null, null, null, 1, null, 26.97, null);
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, null, null, null, null, null, null, '2025-07-06 16:21:05.428148', null, null, null, 1, null, 26.97, null);
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, null, null, null, null, null, null, '2025-07-06 16:24:57.683012', null, null, null, 1, null, 26.97, null);
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, null, null, null, null, null, null, '2025-07-06 16:55:02.009435', null, null, null, 1, null, 26.97, null);
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, null, null, null, null, null, null, '2025-07-06 16:58:35.527442', null, null, null, 1, null, 26.97, null);
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, null, null, null, null, null, null, '2025-07-13 16:07:56.536708', null, null, null, 1, null, 26.97, null);
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, null, null, null, null, null, null, '2025-07-13 16:14:43.293363', null, null, null, 1, null, 26.97, null);
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, null, null, null, null, null, null, '2025-07-13 16:21:12.149481', null, null, null, 1, null, 26.97, null);
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, null, null, null, null, null, null, '2025-07-13 16:22:47.088607', null, null, null, 1, null, 26.97, null);
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, null, null, null, null, null, null, '2025-07-13 16:26:28.359721', null, null, null, 1, null, 26.97, null);
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, null, null, null, null, null, null, '2025-07-13 16:27:25.423917', null, null, null, 1, null, 26.97, null);
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, null, null, null, null, null, null, '2025-07-13 16:34:36.720229', null, null, null, 1, null, 26.97, null);
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, null, null, null, null, null, null, '2025-07-13 16:40:01.092351', null, null, null, 1, null, 26.97, null);
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, null, null, null, null, null, null, '2025-07-13 16:51:24.274689', null, null, null, 1, null, 26.97, null);
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, null, null, null, null, null, null, '2025-07-13 16:59:56.621199', null, null, null, 1, null, 26.97, null);
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, null, null, null, null, null, null, '2025-07-13 17:02:29.551830', null, null, null, 1, null, 26.97, null);
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, null, null, null, null, null, null, '2025-07-13 17:07:36.021786', null, null, null, 1, null, 26.97, null);
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, null, null, null, null, null, null, '2025-07-13 17:20:11.210914', null, null, null, 1, null, 26.97, null);
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, null, null, null, null, null, null, '2025-07-13 17:25:30.875201', null, null, null, 1, null, 26.97, null);
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, null, null, null, null, null, null, '2025-07-15 11:18:11.292809', null, null, null, 1, null, 26.97, null);
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, null, null, null, null, null, null, '2025-07-15 11:20:37.733582', null, null, null, 1, null, 26.97, null);
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, null, null, null, null, null, null, '2025-07-15 11:24:20.594413', null, null, null, 1, null, 26.97, null);
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, null, null, null, null, null, null, '2025-07-15 11:32:28.543682', null, null, null, 1, null, 26.97, null);
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, null, null, null, null, null, null, '2025-07-15 11:42:22.464527', null, null, null, 1, null, 26.97, null);
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, null, null, null, null, null, null, '2025-07-15 11:57:00.641022', null, null, null, 1, null, 26.97, null);
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, null, null, null, null, null, null, '2025-07-15 11:59:25.924207', null, null, null, 1, null, 26.97, null);
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, null, null, null, null, null, null, '2025-07-15 12:00:46.009510', null, null, null, 1, null, 26.97, null);
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, null, null, null, null, null, null, '2025-07-15 12:02:18.268309', null, null, null, 1, null, 26.97, null);
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, null, null, null, null, null, null, '2025-07-15 12:11:32.817748', null, null, null, 1, null, 26.97, null);
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, null, null, null, null, null, null, '2025-07-15 12:13:46.836964', null, null, null, 1, null, 26.97, null);
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, null, null, null, null, null, null, '2025-07-15 12:15:12.457857', null, null, null, 1, null, 26.97, null);
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, null, null, null, null, null, null, '2025-07-15 12:19:49.527475', null, null, null, 1, null, 26.97, null);
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, null, null, null, null, null, null, '2025-07-15 12:20:03.263773', null, null, null, 1, null, 26.97, null);
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, null, null, null, null, null, null, '2025-07-15 12:24:20.992984', null, null, null, 1, null, 26.97, null);
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, null, null, null, null, null, null, '2025-07-15 12:28:53.201917', null, null, null, 1, null, 26.97, null);
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, null, null, null, null, null, null, '2025-07-15 12:29:57.190934', null, null, null, 1, null, 26.97, null);
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, null, null, null, null, null, null, '2025-07-15 12:30:54.976705', null, null, null, 1, null, 26.97, null);
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, null, null, null, null, null, null, '2025-07-15 12:31:58.944515', null, null, null, 1, null, 26.97, null);
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, null, null, null, null, null, null, '2025-07-15 12:32:48.277195', null, null, null, 1, null, 26.97, null);
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, null, null, null, null, null, null, '2025-07-15 12:35:22.876630', null, null, null, 1, null, 26.97, null);
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, null, null, null, null, null, null, '2025-07-15 12:42:07.205044', null, null, null, 1, null, 26.97, null);
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, null, null, null, null, null, null, '2025-07-15 12:43:45.809720', null, null, null, 1, null, 26.97, null);
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, null, null, null, null, null, null, '2025-07-15 12:48:02.062216', null, null, null, 1, null, 26.97, null);
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, 1, null, null, null, null, null, '2025-07-15 12:50:34.283271', null, null, null, 1, null, 26.97, null);
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, 1, null, null, null, null, null, '2025-07-15 13:04:39.213597', null, null, null, 1, null, 26.97, null);
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, 1, null, null, null, null, null, '2025-07-15 13:07:08.076466', null, null, null, 1, null, 26.97, null);
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, 1, null, null, '2025-07-15 13:12:28.451000', null, null, '2025-07-15 13:12:26.411086', null, null, null, 1, null, 26.97, null);
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, 1, null, null, '2025-07-17 09:52:46.605000', null, null, '2025-07-17 09:52:44.581366', null, null, null, 1, null, 26.97, null);
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, 1, null, null, '2025-07-17 10:00:14.109000', null, null, '2025-07-17 10:00:12.070595', null, null, null, 1, null, 26.97, null);
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, 1, null, null, '2025-07-17 10:06:23.473000', null, null, '2025-07-17 10:06:21.441423', null, null, null, 1, null, 26.97, null);
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, 1, null, null, '2025-07-17 10:09:15.454000', null, null, '2025-07-17 10:09:13.431415', null, null, null, 1, null, 26.97, null);
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, 1, null, null, '2025-07-17 10:09:55.039000', null, null, '2025-07-17 10:09:53.008085', null, null, null, 1, null, 26.97, null);
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, 1, null, null, '2025-07-18 09:31:52.669000', null, null, '2025-07-18 09:31:50.631163', null, null, null, 1, null, 26.97, null);
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, 1, null, null, '2025-07-18 09:34:06.705000', null, null, '2025-07-18 09:34:04.682626', null, null, null, 1, null, 26.97, null);
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, 1, null, null, '2025-07-18 09:36:57.135000', null, null, '2025-07-18 09:36:55.110669', null, null, null, 1, null, 26.97, null);
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, 1, null, null, '2025-07-18 09:39:07.063000', null, null, '2025-07-18 09:39:05.044690', null, null, null, 1, null, 26.97, null);
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, 1, null, null, '2025-07-18 11:41:49.320000', null, null, '2025-07-18 11:41:47.293307', null, null, null, 1, null, 26.97, null);
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, 1, null, null, '2025-07-18 11:43:54.837000', null, null, '2025-07-18 11:43:52.808754', null, null, null, 1, null, 26.97, null);
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, 1, null, null, '2025-07-18 11:45:34.871000', '2025-07-18 11:45:44.899000', '2025-07-18 11:46:04.922000', '2025-07-18 11:45:32.845021', null, null, null, 1, null, 26.97, null);
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, 1, null, null, '2025-07-21 07:01:45.542000', '2025-07-21 08:30:06.609000', '2025-07-21 08:30:26.644000', '2025-07-21 07:01:43.494005', null, null, null, null, null, 0.00, '2025-07-21 08:30:01.584000');
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, 1, null, null, '2025-07-21 07:03:14.937000', '2025-07-21 08:30:06.609000', '2025-07-21 08:30:26.644000', '2025-07-21 07:03:12.911395', null, null, null, null, null, 0.00, '2025-07-21 08:30:01.584000');
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, 1, null, null, '2025-07-21 07:08:53.958000', '2025-07-21 08:30:06.612000', '2025-07-21 08:30:26.646000', '2025-07-21 07:08:51.922594', null, null, null, null, null, 0.00, '2025-07-21 08:30:01.585000');
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, 1, null, null, '2025-07-21 07:27:35.417000', '2025-07-21 08:30:06.606000', '2025-07-21 08:30:26.642000', '2025-07-21 07:27:33.387250', null, null, null, null, null, 0.00, '2025-07-21 08:30:01.583000');
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, 1, null, null, '2025-07-21 07:28:30.465000', '2025-07-21 08:30:06.606000', '2025-07-21 08:30:26.644000', '2025-07-21 07:28:28.429238', null, null, null, null, null, 0.00, '2025-07-21 08:30:01.583000');
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, 1, null, null, '2025-07-21 07:34:06.006000', '2025-07-21 08:30:06.603000', '2025-07-21 08:30:26.644000', '2025-07-21 07:34:03.973417', null, null, null, null, null, 0.00, '2025-07-21 08:30:01.583000');
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, 1, null, null, '2025-07-21 07:46:26.524000', '2025-07-21 08:30:06.609000', '2025-07-21 08:30:26.643000', '2025-07-21 07:46:24.490426', null, null, null, null, null, 0.00, '2025-07-21 08:30:01.585000');
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, null, null, null, null, null, null, '2025-07-21 08:10:04.831747', null, null, null, null, null, 0.00, null);
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, 1, null, null, '2025-07-21 08:12:12.781000', '2025-07-21 08:30:06.606000', '2025-07-21 08:30:26.644000', '2025-07-21 08:12:10.758795', null, null, null, null, null, 0.00, '2025-07-21 08:30:01.583000');
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, 1, null, null, '2025-07-21 08:12:54.548000', '2025-07-21 08:30:06.606000', '2025-07-21 08:30:26.643000', '2025-07-21 08:12:52.528032', null, null, null, null, null, 0.00, '2025-07-21 08:30:01.582000');
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, 1, null, null, '2025-07-21 08:16:41.713000', '2025-07-21 08:30:06.612000', '2025-07-21 08:30:26.645000', '2025-07-21 08:16:39.692388', null, null, null, null, null, 0.00, '2025-07-21 08:30:01.585000');
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, 1, null, null, '2025-07-21 08:19:45.544000', '2025-07-21 08:30:06.611000', '2025-07-21 08:30:26.645000', '2025-07-21 08:19:43.520223', null, null, null, null, null, 0.00, '2025-07-21 08:30:01.586000');
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, 1, null, null, '2025-07-21 08:22:44.857000', '2025-07-21 08:30:06.609000', '2025-07-21 08:30:26.643000', '2025-07-21 08:22:42.821349', null, null, null, null, null, 0.00, '2025-07-21 08:30:01.586000');
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, 1, null, null, '2025-07-21 08:23:48.078000', '2025-07-21 08:30:06.609000', '2025-07-21 08:30:26.644000', '2025-07-21 08:23:46.040843', null, null, null, null, null, 0.00, '2025-07-21 08:30:01.586000');
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, 1, null, null, '2025-07-21 08:24:42.108000', '2025-07-21 08:30:06.614000', '2025-07-21 08:30:26.646000', '2025-07-21 08:24:40.083526', null, null, null, null, null, 0.00, '2025-07-21 08:30:01.586000');
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, 1, null, null, '2025-07-21 08:27:41.376000', '2025-07-21 08:30:06.612000', '2025-07-21 08:30:26.646000', '2025-07-21 08:27:39.349118', null, null, null, null, null, 0.00, '2025-07-21 08:30:01.586000');
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, 1, null, null, '2025-07-21 08:29:19.637000', '2025-07-21 08:30:06.612000', '2025-07-21 08:30:26.645000', '2025-07-21 08:29:17.591647', null, null, null, null, null, 0.00, '2025-07-21 08:30:01.586000');
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, 1, null, null, '2025-07-21 08:33:47.756000', '2025-07-21 08:33:57.802000', '2025-07-21 08:34:17.832000', '2025-07-21 08:33:45.716756', null, null, null, null, null, 0.00, '2025-07-21 08:33:52.785000');
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, 1, null, null, '2025-07-21 08:35:21.501000', '2025-07-21 08:35:31.563000', '2025-07-21 08:35:51.586000', '2025-07-21 08:35:19.471484', null, null, null, null, null, 0.00, '2025-07-21 08:35:26.532000');
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, 1, null, null, '2025-07-21 08:39:01.548000', '2025-07-21 08:39:11.596000', '2025-07-21 08:39:31.619000', '2025-07-21 08:38:59.520599', null, null, null, null, null, 0.00, '2025-07-21 08:39:06.577000');
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, null, 1, 2, null, null, null, '2025-07-21 09:17:12.971971', null, null, null, 1, null, 8.99, null);
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, 1, 1, 2, '2025-07-21 09:19:56.343000', '2025-07-21 09:20:06.367000', '2025-07-21 09:20:26.391000', '2025-07-21 09:19:54.314625', null, null, null, 1, null, 8.99, '2025-07-21 09:20:01.351000');
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, 1, 1, 2, '2025-07-21 09:21:00.071000', '2025-07-21 09:21:10.125000', '2025-07-21 09:21:30.150000', '2025-07-21 09:20:58.036802', null, null, null, 2, null, 3.99, '2025-07-21 09:21:05.107000');
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, 1, 1, 2, '2025-07-21 09:23:40.190000', '2025-07-21 09:23:50.243000', '2025-07-21 09:24:10.266000', '2025-07-21 09:23:38.153358', null, null, null, 1, null, 17.98, '2025-07-21 09:23:45.228000');
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, 1, 1, 2, '2025-07-21 09:25:58.342000', '2025-07-21 09:26:08.406000', '2025-07-21 09:26:28.435000', '2025-07-21 09:25:56.297487', null, null, null, 2, null, 9.97, '2025-07-21 09:26:03.378000');
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, 1, 1, 2, '2025-07-21 09:29:16.037000', '2025-07-21 09:29:26.085000', '2025-07-21 09:29:46.109000', '2025-07-21 09:29:14.008953', null, null, null, 2, null, 5.98, '2025-07-21 09:29:21.069000');
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, 1, 1, 2, '2025-07-21 09:31:27.998000', '2025-07-21 09:31:38.031000', '2025-07-21 09:31:58.056000', '2025-07-21 09:31:25.950291', null, null, null, 1, null, 8.99, '2025-07-21 09:31:33.015000');
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, null, 1, 2, null, null, null, '2025-07-21 09:38:52.316448', null, null, null, 1, null, 8.99, null);
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, 1, 1, 2, '2025-07-21 09:39:27.357000', '2025-07-21 09:39:37.392000', '2025-07-21 09:39:57.412000', '2025-07-21 09:39:25.317477', null, null, null, 1, null, 8.99, '2025-07-21 09:39:32.376000');
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, 1, 1, 2, '2025-07-21 09:41:37.233000', '2025-07-21 09:41:47.287000', '2025-07-21 09:42:07.312000', '2025-07-21 09:41:35.203225', null, null, null, 1, null, 8.99, '2025-07-21 09:41:42.271000');
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (null, null, 1, 2, null, null, null, '2025-07-21 21:41:38.432363', null, null, null, 1, null, 8.99, null);
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (null, 1, 1, 2, '2025-07-21 21:42:00.010000', '2025-07-21 21:42:10.103000', '2025-07-21 21:42:30.169000', '2025-07-21 21:41:57.966139', null, null, null, 1, null, 8.99, '2025-07-21 21:42:05.082000');
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (null, 1, 1, 2, '2025-07-21 21:46:19.411000', '2025-07-21 21:46:29.501000', '2025-07-21 21:46:49.579000', '2025-07-21 21:46:17.388064', null, null, null, 1, null, 8.99, '2025-07-21 21:46:24.481000');
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (null, 1, 1, 2, '2025-07-21 21:55:25.594000', '2025-07-21 21:55:35.627000', '2025-07-21 21:55:55.693000', '2025-07-21 21:55:23.577371', null, null, null, 1, null, 8.99, '2025-07-21 21:55:30.610000');
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (1, 1, 1, 2, '2025-07-21 22:01:01.420000', '2025-07-21 22:01:11.503000', '2025-07-21 22:01:31.565000', '2025-07-21 22:00:59.390711', null, null, null, 1, null, 8.99, '2025-07-21 22:01:06.479000');
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (4, 1, 1, 2, '2025-07-21 22:04:53.283000', '2025-07-21 22:05:03.362000', '2025-07-21 22:05:23.422000', '2025-07-21 22:04:51.257469', null, null, null, 1, null, 8.99, '2025-07-21 22:04:58.349000');
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (4, 1, 1, 2, '2025-07-21 22:08:33.620000', '2025-07-21 22:08:43.707000', '2025-07-21 22:09:03.779000', '2025-07-21 22:08:31.595331', null, null, null, 2, null, 3.99, '2025-07-21 22:08:38.678000');
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (4, 1, 1, 2, '2025-07-22 06:19:06.552000', '2025-07-22 06:19:16.619000', '2025-07-22 06:19:36.694000', '2025-07-22 06:19:04.513822', null, null, null, 1, null, 8.99, '2025-07-22 06:19:11.607000');
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (4, 1, 1, 2, '2025-07-22 06:20:14.048000', '2025-07-22 06:20:24.083000', '2025-07-22 06:20:44.156000', '2025-07-22 06:20:12.027345', null, null, null, 1, null, 8.99, '2025-07-22 06:20:19.066000');
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (4, 1, 1, 2, '2025-07-22 07:25:18.697000', '2025-07-22 07:25:28.792000', '2025-07-22 07:25:48.865000', '2025-07-22 07:25:16.660942', null, null, null, 2, null, 3.99, '2025-07-22 07:25:23.765000');
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (4, 1, 1, 2, '2025-07-22 07:39:54.352000', '2025-07-22 07:40:04.432000', '2025-07-22 07:40:24.495000', '2025-07-22 07:39:52.317832', null, null, null, 2, null, 6.98, '2025-07-22 07:39:59.411000');
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (4, 1, 1, 2, '2025-07-22 08:19:22.640000', '2025-07-22 08:19:32.685000', '2025-07-22 08:19:52.747000', '2025-07-22 08:19:20.613061', null, null, null, 2, null, 6.98, '2025-07-22 08:19:27.668000');
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (4, 1, 1, 2, '2025-07-22 08:20:40.109000', '2025-07-22 08:20:50.175000', '2025-07-22 08:21:10.238000', '2025-07-22 08:20:38.076242', null, null, null, 2, null, 3.99, '2025-07-22 08:20:45.160000');
INSERT INTO public.orders (client_id, driver_id, pickup_address_id, delivery_address_id, accepted_at, picked_up_at, delivered_at, created_at, client_rating_driver, client_rating_restaurant, special_request, restaurant_id, canceled_by, total_price, ready_at) VALUES (4, 1, 1, 2, '2025-07-22 09:38:47.648000', '2025-07-22 09:38:57.732000', '2025-07-22 09:39:17.793000', '2025-07-22 09:38:45.629248', null, null, null, 2, null, 3.99, '2025-07-22 09:38:52.708000');

INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (35, 1, 1, null);
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (35, 1, 2, 'Extra sauce');
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (36, 1, 1, null);
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (36, 1, 2, 'Extra sauce');
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (37, 1, 1, null);
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (37, 1, 2, 'Extra sauce');
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (38, 1, 1, null);
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (38, 1, 2, 'Extra sauce');
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (39, 1, 1, null);
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (39, 1, 2, 'Extra sauce');
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (40, 1, 1, null);
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (40, 1, 2, 'Extra sauce');
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (41, 1, 1, null);
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (41, 1, 2, 'Extra sauce');
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (42, 1, 1, null);
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (42, 1, 2, 'Extra sauce');
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (43, 1, 1, null);
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (43, 1, 2, 'Extra sauce');
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (44, 1, 1, null);
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (44, 1, 2, 'Extra sauce');
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (45, 1, 1, null);
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (45, 1, 2, 'Extra sauce');
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (46, 1, 1, null);
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (46, 1, 2, 'Extra sauce');
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (47, 1, 1, null);
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (47, 1, 2, 'Extra sauce');
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (48, 1, 1, null);
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (48, 1, 2, 'Extra sauce');
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (49, 1, 1, null);
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (49, 1, 2, 'Extra sauce');
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (50, 1, 1, null);
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (50, 1, 2, 'Extra sauce');
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (51, 1, 1, null);
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (51, 1, 2, 'Extra sauce');
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (52, 1, 1, null);
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (52, 1, 2, 'Extra sauce');
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (53, 1, 1, null);
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (53, 1, 2, 'Extra sauce');
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (54, 1, 1, null);
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (54, 1, 2, 'Extra sauce');
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (55, 1, 1, null);
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (55, 1, 2, 'Extra sauce');
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (56, 1, 1, null);
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (56, 1, 2, 'Extra sauce');
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (57, 1, 1, null);
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (57, 1, 2, 'Extra sauce');
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (58, 1, 1, null);
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (58, 1, 2, 'Extra sauce');
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (59, 1, 1, null);
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (59, 1, 2, 'Extra sauce');
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (60, 1, 1, null);
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (60, 1, 2, 'Extra sauce');
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (61, 1, 1, null);
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (61, 1, 2, 'Extra sauce');
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (62, 1, 1, null);
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (62, 1, 2, 'Extra sauce');
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (63, 1, 1, null);
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (63, 1, 2, 'Extra sauce');
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (64, 1, 1, null);
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (64, 1, 2, 'Extra sauce');
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (65, null, 1, null);
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (66, null, 1, null);
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (67, null, 1, null);
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (68, null, 1, null);
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (69, null, 1, null);
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (70, null, 1, null);
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (71, null, 1, null);
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (72, null, 1, null);
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (73, null, 1, null);
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (74, null, 1, null);
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (75, null, 1, null);
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (75, null, 1, null);
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (76, null, 1, null);
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (77, null, 1, null);
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (78, null, 1, null);
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (79, null, 1, null);
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (80, null, 1, null);
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (81, null, 1, null);
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (82, null, 1, null);
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (83, null, 1, null);
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (84, null, 1, null);
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (102, 1, 1, null);
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (103, 1, 1, null);
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (104, 3, 1, null);
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (105, 1, 2, null);
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (106, 3, 1, null);
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (106, 4, 2, null);
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (107, 4, 2, null);
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (108, 1, 1, null);
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (109, 1, 1, null);
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (110, 1, 1, null);
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (111, 1, 1, null);
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (112, 1, 1, null);
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (113, 1, 1, null);
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (114, 1, 1, null);
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (115, 1, 1, null);
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (116, 1, 1, null);
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (117, 1, 1, null);
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (118, 3, 1, null);
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (119, 1, 1, null);
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (120, 1, 1, null);
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (121, 3, 1, null);
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (122, 3, 1, null);
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (122, 4, 1, null);
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (123, 3, 1, null);
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (123, 4, 1, null);
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (124, 3, 1, null);
INSERT INTO public.order_items (order_id, restaurant_item_id, quantity, special_request) VALUES (125, 3, 1, null);


INSERT INTO public.vehicle_types (vehicle_type_id, vehicle_type_name) VALUES (1, 'Car');
INSERT INTO public.vehicle_types (vehicle_type_id, vehicle_type_name) VALUES (2, 'Bike');
INSERT INTO public.vehicle_types (vehicle_type_id, vehicle_type_name) VALUES (3, 'Scooter');
INSERT INTO public.vehicle_types (vehicle_type_id, vehicle_type_name) VALUES (4, 'Van');
INSERT INTO public.vehicle_types (vehicle_type_id, vehicle_type_name) VALUES (5, 'Truck');

INSERT INTO public.vehicles (vehicle_id, driver_id, license_plate, vehicle_type, brand, model, color, production_year, registered_at) VALUES (1, 1, 'ABC123', 1, 'Toyota', 'Corolla', 'Red', 2019, '2025-07-04 12:57:33.568040');
INSERT INTO public.vehicles (vehicle_id, driver_id, license_plate, vehicle_type, brand, model, color, production_year, registered_at) VALUES (2, 2, 'XYZ789', 2, 'Honda', 'CBR500R', 'Black', 2021, '2025-07-04 12:57:33.568040');
