'use strict';

import indexTests from './routes/index';

import {describe} from 'mocha';
import {expect, should} from 'chai';

describe('Routes', () => {
  indexTests();
});