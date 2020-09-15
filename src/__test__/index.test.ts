import DokuflowClient from '../index';

test('Create Client', () => {
  const client = new DokuflowClient({
    apiKey: 'test',
    spaceName: 'test',
  });
  expect(client).toBeInstanceOf(DokuflowClient);
});
