import { schemaComposer } from 'graphql-compose';
import ApolloError from '../lib/NoSentryError';
import { OrderDocument } from '../models/Order';
import { Bill, BillTC } from '../models/Bill';
import { Currency } from '../models/Currency';
import { DeliveryNote } from '../models/DeliveryNote';

type TCreateBillInput = {
  deliveryNoteId: string;
  currencyId: string;
  rate: number;
};

const CreateBillInput = `
  input CreateBillInput {
    deliveryNoteId: String!
    currencyId: String!
    rate: Int!
  }
`;

function generateControlNumber(controlNumbers: string[]) {
  let _controlNumbers = controlNumbers.map(Number);
  _controlNumbers = _controlNumbers.sort((a, b) => b - a);
  let controlNumber = String(_controlNumbers[0] + 1);
  if (controlNumbers.length === 0) {
    controlNumber = '1';
  }
  let controlNumArray = Array<string>(9).fill('0');
  for (
    let i = 0, j = controlNumber.length - 1;
    i < controlNumArray.length;
    i += 1
  ) {
    controlNumArray[j] = controlNumber.charAt(i);
    j -= 1;
  }
  controlNumArray = controlNumArray.reverse();
  return controlNumArray.join('');
}

// eslint-disable-next-line import/prefer-default-export
export const createBill = schemaComposer.createResolver<
  any,
  {
    data: TCreateBillInput;
  }
>({
  name: 'createBill',
  type: BillTC.getType(),
  description: 'Generate a Bill based on a ',
  kind: 'mutation',
  args: {
    data: CreateBillInput,
  },
  resolve: async ({ args, context }) => {
    const { deliveryNoteId, currencyId, rate } = args.data;
    const [deliveryNote, bills, currency] = await Promise.all([
      DeliveryNote.findById(deliveryNoteId).populate('order'),
      Bill.find({}, 'controlNumber'),
      Currency.findById(currencyId),
    ]);
    if (!deliveryNote) {
      throw new ApolloError(`The Delivery Note with id: ${deliveryNoteId}`);
    }
    if (!currencyId) {
      throw new ApolloError(`The Currency Note with id: ${currencyId}`);
    }
    const controlNumber = generateControlNumber(
      bills.map((_bill) => _bill.controlNumber)
    );
    const bill = await Bill.create({
      controlNumber,
      charges: deliveryNote.charges,
      currency: currency._id,
      order: (deliveryNote.order as OrderDocument)._id,
      paymentMetadata: deliveryNote.paymentMetadata || {},
      rate,
      subtotal: (deliveryNote.order as OrderDocument).subtotal * rate,
      discount: (deliveryNote.order as OrderDocument).discount * rate,
      tax: (deliveryNote.order as OrderDocument).tax * rate,
      total: (deliveryNote.order as OrderDocument).total * rate,
      paid: true,
    });
    await DeliveryNote.findOneAndUpdate(
      {
        _id: deliveryNote._id,
      },
      {
        bill: bill._id,
        generatedBill: true,
      },
      {
        new: true,
        runValidators: true,
      }
    );
    return bill;
  },
});
