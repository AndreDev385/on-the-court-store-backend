import express from 'express';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import jwt from 'jsonwebtoken';
// import morgan from 'morgan';
import { User } from './models';

const app = express();

app.set('port', Number(process.env.PORT) || 3000);
app.use(compression());
app.use(cookieParser());
app.use(
  helmet({
    contentSecurityPolicy:
      process.env.NODE_ENV === 'production' ? undefined : false,
  })
);
// app.use(morgan('short'));
app.use(
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const { token } = req.cookies;
    if (!token) {
      return next();
    }
    const payload = jwt.decode(token) as { id: string };
    const me = User.findById(payload.id);

    if (!me) {
      // ? Creo que deberia lanzar un error
      return next();
    }
    res.locals.user = me;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    req.user = me;
    next();
  }
);

export default app;
