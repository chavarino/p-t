import { MongoObservable } from 'meteor-rxjs';

import { Message } from '../models/message';
import { Map} from '../models/map';


export const Msg = new MongoObservable.Collection<Message>('msg');
