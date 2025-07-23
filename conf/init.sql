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
GRANT INSERT ON TABLE clients TO authservice;
GRANT USAGE ON SEQUENCE clients_client_id_seq TO authservice;
GRANT INSERT ON TABLE drivers TO authservice;
GRANT USAGE ON SEQUENCE drivers_driver_id_seq TO authservice;
GRANT INSERT ON TABLE restaurants TO authservice;


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

INSERT INTO public.vehicle_types (vehicle_type_id, vehicle_type_name) VALUES (1, 'Car');
INSERT INTO public.vehicle_types (vehicle_type_id, vehicle_type_name) VALUES (2, 'Bike');
INSERT INTO public.vehicle_types (vehicle_type_id, vehicle_type_name) VALUES (3, 'Scooter');
INSERT INTO public.vehicle_types (vehicle_type_id, vehicle_type_name) VALUES (4, 'Van');
INSERT INTO public.vehicle_types (vehicle_type_id, vehicle_type_name) VALUES (5, 'Truck');

INSERT INTO public.vehicles (vehicle_id, driver_id, license_plate, vehicle_type, brand, model, color, production_year, registered_at) VALUES (1, 1, 'ABC123', 1, 'Toyota', 'Corolla', 'Red', 2019, '2025-07-04 12:57:33.568040');
INSERT INTO public.vehicles (vehicle_id, driver_id, license_plate, vehicle_type, brand, model, color, production_year, registered_at) VALUES (2, 2, 'XYZ789', 2, 'Honda', 'CBR500R', 'Black', 2021, '2025-07-04 12:57:33.568040');
