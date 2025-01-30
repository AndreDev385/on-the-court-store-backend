import { format } from 'date-fns';
import { es } from 'date-fns/locale';

type Props = {
  name: string;
  actionUrl: string;
  promoCode: string;
  expiration: Date;
  percentage: number;
};

export function WelcomeEmail({
  name,
  actionUrl,
  promoCode,
  expiration,
  percentage,
}: Props): React.ReactNode {
  return (
    <>
      <h1>On the court</h1>

      <p style={{ fontSize: '1rem', color: '#020617' }}>Hola, {name}</p>

      <p style={{ fontSize: '1rem', color: '#020617' }}>
        Te damos la bienvenida a On the court, donde podrás encontrar todos los
        artículos deportivos que necesitas para tu próxima visita a la cancha.
      </p>

      <p style={{ fontSize: '1rem', color: '#020617' }}>
        Para celebrar tu ingreso, te damos la bienvenida con un código de
        promoción con el que podrás obtener un descuento de {percentage}%, el
        cual estará disponible hasta el{' '}
        {format(expiration, 'dd/MM/yyyy', { locale: es })}.
      </p>

      <p>{promoCode}</p>

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
        Empieza a comprar ahora
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
