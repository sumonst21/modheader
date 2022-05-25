import { evaluateValue } from './utils.js';

describe('utils', () => {
  afterEach(() => {
    delete localStorage.evaluateValueIndex;
  });

  test('evaluateValue - simple value', () => {
    const actual = evaluateValue({ value: `Hello world` });

    expect(actual).toEqual('Hello world');
  });

  test('evaluateValue - simple function', () => {
    const actual = evaluateValue({ value: `function() { return 'foobar'; }` });

    expect(actual).toEqual('foobar');
  });

  test('evaluateValue - dynamic function', () => {
    const dynamicFunction = `function() {
      if (!localStorage.evaluateValueIndex) {
        localStorage.evaluateValueIndex = 0;
      } else {
        localStorage.evaluateValueIndex++;
      }
      return localStorage.evaluateValueIndex;
    }`;
    expect(
      evaluateValue({
        value: dynamicFunction
      })
    ).toEqual('0');
    expect(
      evaluateValue({
        value: dynamicFunction
      })
    ).toEqual('1');
    expect(
      evaluateValue({
        value: dynamicFunction
      })
    ).toEqual('2');
  });

  test('evaluateValue - receive URL', () => {
    const actual = evaluateValue({
      value: `function({ url }) { return url + '/test'; }`,
      url: 'https://modheader.com'
    });

    expect(actual).toEqual('https://modheader.com/test');
  });

  test('evaluateValue - receive old value', () => {
    const actual = evaluateValue({
      value: `function({ oldValue }) { return oldValue + '-test'; }`,
      oldValue: 'oldValue'
    });

    expect(actual).toEqual('oldValue-test');
  });
});
