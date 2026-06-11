CREATE TABLE IF NOT EXISTS narudzbine (
    id BIGSERIAL PRIMARY KEY,
    ime VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    br_tel VARCHAR(50),
    datum DATE NOT NULL,
    vreme TIME NOT NULL,
    mesto TEXT,
    cena DECIMAL(10,2) DEFAULT 0,
    porudzbina JSONB NOT NULL,
    placeno BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO narudzbine (
    ime,
    email,
    br_tel,
    datum,
    vreme,
    mesto,
    cena,
    porudzbina,
    placeno
)
VALUES (
    'Nemanja',
    'nemanja@gmail.com',
    '061123456',
    '2026-06-15',
    '18:00',
    'Kragujevac',
    25000,
    '{"meni": "Personalizovani", "sadrzaj": ["Prasece pecenje", "Ruska salata", "Torta"], "brOsoba": 50}',
    true
) ON CONFLICT DO NOTHING;
