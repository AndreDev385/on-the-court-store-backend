type Props = {
  name: string;
  actionUrl: string;
};

export function ResetPasswordEmail({
  name,
  actionUrl,
}: Props): React.ReactNode {
  return (
    <>
      <h1>On the court</h1>

      <p style={{ fontSize: '1rem', color: '#020617' }}>Hola, {name}</p>

      <p style={{ fontSize: '1rem', color: '#020617' }}>
        Has solicitado un cambio de contraseña desde On the court. Para
        continuar con tu cambio de contraseña, haz click en el botón de abajo.
        Si no has solicitado dicho cambio ignora este correo.
      </p>

      <a
        href={actionUrl}
        style={{
          background: '#000',
          color: '#fff',
          padding: '8px 16px',
          borderRadius: '4px',
          textDecoration: 'none',
          fontWeight: 'bold',
        }}
      >
        Cambiar contraseña
      </a>

      <p style={{ fontSize: '1rem', color: '#020617' }}>
        En caso de que estés teniendo problemas con el botón de arriba, puedes
        copiar y pegar el siguiente enlace en tu navegador:
      </p>

      <p style={{ fontSize: '1rem', color: '#020617' }}>{actionUrl}</p>

      <p style={{ fontSize: '1rem', color: '#020617' }}>
        ¡Saludos!
        <br />
        El equipo de On the court
      </p>
    </>
  );
}
