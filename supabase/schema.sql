CREATE TABLE registros (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  correo VARCHAR(100) NOT NULL UNIQUE,
  cedula VARCHAR(20) NOT NULL UNIQUE,
  telefono VARCHAR(20) NOT NULL,
  edad INT NOT NULL,
  distrito_educativo VARCHAR(100) NOT NULL,
  centro_educativo VARCHAR(100) NOT NULL,
  rol VARCHAR(50) NOT NULL,
  area VARCHAR(100) NOT NULL,
  qr_bloqueado BOOLEAN DEFAULT true,
  check_in_realizado BOOLEAN DEFAULT false,
  entrada_realizada BOOLEAN DEFAULT false,
  salida_realizada BOOLEAN DEFAULT false,
  timestamp_registro TIMESTAMPTZ DEFAULT NOW(),
  timestamp_checkin TIMESTAMPTZ,
  timestamp_entrada TIMESTAMPTZ,
  timestamp_salida TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE registros ENABLE ROW LEVEL SECURITY;

CREATE POLICY "insert_public" ON registros FOR INSERT WITH CHECK (true);
CREATE POLICY "select_service" ON registros FOR SELECT USING (true);
CREATE POLICY "update_service" ON registros FOR UPDATE USING (true);
