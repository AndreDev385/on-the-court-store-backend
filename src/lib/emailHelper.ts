import * as postmark from 'postmark';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { UserDocument } from '../models/User';
import { PromoCodeDocument } from '../models/PromoCode';

dayjs.locale('es');

interface BrowserDetectInfo {
  name?: string;
  version?: string;
  versionNumber?: number;
  mobile?: boolean;
  os?: string;
}

// const client = new postmark.ServerClient(process.env.POSTMARK_TOKEN);

export async function resetPasswordEmail(
  user: UserDocument,
  token: string,
  browser: BrowserDetectInfo
): Promise<void> {
  try {
    const emailOptions = {
      From: `Riccardo @ On The Court <info@onthecourt.online>`,
      To: `${user?.email}`,
      TemplateAlias: 'password-reset',
      TemplateModel: {
        product_url: 'https://onthecourt.online',
        product_name: 'On the Court',
        name: user?.name ?? '',
        action_url: `https://onthecourt.online/reset-password/${token}`,
        operating_system: browser?.os ?? 'N/A',
        browser_name: `${browser?.name ?? 'N/A'} ${browser?.version ?? '-'}`,
        support_url: 'https://onthecourt.online/support',
        company_name: 'On the Court',
        company_address: 'Caracas, Venezuela',
      },
    };
    // await client.sendEmailWithTemplate(emailOptions);
  } catch (err) {
    console.log(err);
  }
}

type Receipt = {
  controlNumber: string;
  details: Array<{ description: string; amount: string }>;
  total: string;
};

export async function billMail(
  user: UserDocument,
  receipt: Receipt
): Promise<void> {
  try {
    const emailOptions = {
      From: `Riccardo @ On The Court <info@onthecourt.online>`,
      To: `${user?.email}`,
      Cc: `info@onthecourt.online`,
      TemplateAlias: 'receipt',
      TemplateModel: {
        product_url: 'https://onthecourt.online',
        product_name: 'On the Court',
        name: user?.name ?? '',
        action_url: `https://onthecourt.online`,
        support_url: 'https://onthecourt.online/support',
        company_name: 'On the Court',
        company_address: 'Caracas, Venezuela',
        receipt_id: receipt?.controlNumber ?? 'N/A',
        date: new Date().toISOString().slice(0, 10),
        receipt_details: receipt?.details ?? [],
        total: receipt?.total,
      },
    };
    // await client.sendEmailWithTemplate(emailOptions);
  } catch (err) {
    console.log(err);
  }
}

export async function welcomeEmail(
  user: UserDocument,
  promoCode: PromoCodeDocument
): Promise<void> {
  try {
    const emailOptions = {
      From: `Riccardo @ On The Court <info@onthecourt.online>`,
      To: `${user?.email}`,
      TemplateAlias: 'welcome',
      TemplateModel: {
        product_url: 'https://onthecourt.online',
        product_name: 'On The Court',
        name: user?.name ?? '',
        login_url: 'https://onthecourt.online/sign-in',
        email: user?.email ?? '',
        support_email: 'info@onthecourt.online',
        live_chat_url: 'https://api.whatsapp.com/send?phone=+584269158594',
        promo_code: promoCode?.code,
        expiration: dayjs(new Date(promoCode?.expirationDate)).format(
          'DD/MM/YYYY'
        ),
        percentage: promoCode?.discount,
        company_name: 'On The Court',
        company_address: 'Caracas',
      },
    };
    // await client.sendEmailWithTemplate(emailOptions);
  } catch (err) {
    console.log(err);
  }
}
