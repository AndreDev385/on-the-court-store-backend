/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable import/newline-after-import */
/* eslint-disable import/first */
import dotenv from 'dotenv';
dotenv.config({ path: './src/variables.env' });
import mongoose from 'mongoose';
import axios from 'axios';
import xlsx from 'xlsx';
import dayjs from 'dayjs';
import { Brand } from '../models/Brand';
import { Product } from '../models/Product';
import { Location } from '../models/Location';
import { Variant } from '../models/Variant';
import { VariantValue, VariantValueDocument } from '../models/VariantValue';

mongoose
  .connect(String(process.env.DATABASE), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => {
    console.log(`🤩🍃 MongoDB is Running`);
  })
  .catch((err) => {
    console.log(`❌🤬 ${err}`);
    process.exit();
  });

mongoose.connection.on('error', (err) => `❌🤬❌🤬 ${err}`);

type Columns = {
  CODIGO: string;
  TITULO: string;
  MARCA: string;
  PRECIO: string;
  CANTIDAD: string;
};

interface VolumeRunner {
  url: string;
}

async function bulkUpload({ url }: VolumeRunner) {
  try {
    const { data } = await axios.get<ArrayBuffer>(url, {
      responseType: 'arraybuffer',
    });
    const workbook = xlsx.read(new Uint8Array(data), {
      type: 'array',
    });
    const objects: Array<Columns> = xlsx.utils.sheet_to_json(
      workbook.Sheets[workbook.SheetNames[0]]
    );
    const today = new Date();
    const productsObjects: any[] = [];
    const newProductsObjects: any[] = [];
    const variantValuesObjects: any[] = [];
    const promises: any[] = [];
    await Brand.bulkWrite(
      objects.map((object) => ({
        updateOne: {
          filter: {
            name: String(object.MARCA),
          },
          update: {
            name: String(object.MARCA),
          },
          upsert: true,
        },
      }))
    );
    const [brands, products, location] = await Promise.all([
      Brand.find({}),
      Product.find({}).populate('variantValues'),
      Location.findOne(),
    ]);
    objects.forEach((object) => {
      const brand = brands.find((b) => String(b.name) === String(object.MARCA));
      const product = products.find(
        (p) => String(p.altCode) === String(object.CODIGO)
      );
      if (!product) {
        // create
        const variant = new Variant({
          title: 'N/A',
          tags: ['N/A'],
          createdAt: today,
          updatedAt: today,
        });
        const variantValue = new VariantValue({
          value: {
            variant1: 'N/A',
          },
          price: Number(object.PRECIO),
          quantity: Number(object.CANTIDAD),
          location: location._id,
          disabled: false,
          createdAt: today,
          updatedAt: today,
        });
        const newProduct: Record<string, any> = {
          insertOne: {
            document: {
              altCode: object.CODIGO,
              title: object.TITULO,
              description: '<p></p>',
              dataSheet: '<p></p>',
              priority: 2,
              photos: [],
              isService: false,
              active: true,
              brand: brand._id,
              variants: [variant?._id],
              variantValues: [variantValue?._id],
              categories: [],
              sku: 'N/A',
              price: Number(object.PRECIO) * 100,
              createdAt: today,
              updatedAt: today,
            },
          },
        };
        newProductsObjects.push(newProduct);
        promises.push(variant.save(), variantValue.save());
      } else {
        const variantValues = product.variantValues as VariantValueDocument[];
        productsObjects.push({
          updateOne: {
            filter: {
              altCode: String(object.CODIGO),
            },
            update: {
              title: String(object.TITULO),
              brand: brand._id,
              price: Number(object.PRECIO) * 100,
              updatedAt: today,
            },
            upsert: true,
          },
        });
        variantValues.forEach((variantValue) => {
          variantValuesObjects.push({
            updateOne: {
              filter: {
                _id: variantValue._id,
              },
              update: {
                price: Number(object.PRECIO) * 100,
                quantity: Number(object.CANTIDAD),
                updatedAt: today,
              },
            },
          });
        });
      }
    });
    await Promise.all(promises);
    await Promise.all([
      VariantValue.bulkWrite(variantValuesObjects),
      Product.bulkWrite(newProductsObjects),
      Product.bulkWrite(productsObjects),
    ]);
    return { success: true };
  } catch (err) {
    return { success: false, err: err.message };
  }
}

process.on('message', async (msg) => {
  const message = await bulkUpload(msg.data);
  process.send({ value: message, event: msg.event });
});
