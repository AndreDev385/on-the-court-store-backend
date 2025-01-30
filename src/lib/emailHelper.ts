import 'dayjs/locale/es';
import { Resend } from 'resend';

import { UserDocument } from '../models/User';
import { PromoCodeDocument } from '../models/PromoCode';
import { WelcomeEmail } from './templates/WelcomeEmail';
import { ResetPasswordEmail } from './templates/ResetPasswordEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function resetPasswordEmail(
  user: UserDocument,
  token: string
): Promise<void> {
  const result = await resend.emails
    .send({
      from: 'On the court <riccardo@onthecourtstore.com>',
      to: [user.email],
      subject: 'Cambio de contraseña',
      react: ResetPasswordEmail({
        name: user?.name ?? '',
        actionUrl: `https://onthecourt.vercel.app/store/reset-password/${token}`,
      }),
    })
    .catch((err) => {
      console.log({ err });
    });

  console.log({ result });
}

export async function welcomeEmail(
  user: UserDocument,
  promoCode: PromoCodeDocument
): Promise<void> {
  const result = await resend.emails
    .send({
      from: 'On the court <riccardo@onthecourtstore.com>',
      to: [user.email],
      subject: 'Bienvenida!',
      react: WelcomeEmail({
        name: user.name,
        actionUrl: 'https://onthecourt.vercel.app/store/sign-in',
        promoCode: promoCode.code,
        expiration: new Date(promoCode.expirationDate),
        percentage: promoCode.discount,
      }),
    })
    .catch((err) => {
      console.log({ err });
    });

  console.log({ result });
}
