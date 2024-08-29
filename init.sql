CREATE TABLE IF NOT EXISTS measures (
    customer_code VARCHAR(255) NOT NULL,
    measure_datetime TIMESTAMP NOT NULL,
    measure_type VARCHAR(50) NOT NULL,
    measure_value INTEGER NOT NULL,
    image_url TEXT NOT NULL,
    measure_uuid UUID NOT NULL UNIQUE,
    has_confirmed BOOLEAN NOT NULL DEFAULT FALSE
);
