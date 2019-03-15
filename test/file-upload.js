const {expect} = require('chai');
const express = require('express');
const multer = require('multer');
const nock = require('nock');
const path = require('path');
const supertest = require('supertest');
const {TrelloStorage} = require('../index');

const createServer = () => {
  const middleware = multer({
    storage: new TrelloStorage({
      board: 'board-id',
      list: 'list-id',
      key: 'trello-key',
      token: 'trello-token',
    }),
  });
  const controller = (req, res) => res.json(req.file);
  const server = express();
  server.post('/upload', middleware.single('picture'), controller);
  return supertest(server);
};

describe('multer-trello', () => {
  afterEach(() => nock.cleanAll());

  it('should upload the file', () => {
    const scope = nock('https://api.trello.com/1')
      .post('/cards', {name: 'image.jpg'})
      .query({
        idList: 'list-id',
        key: 'trello-key',
        token: 'trello-token',
      })
      .reply(200, {
        id: '560bf48efe2771efe9b45997',
        name: 'image.jpg',
        idList: 'list-id',
      })
      .post('/cards/560bf48efe2771efe9b45997/attachments')
      .query({
        key: 'trello-key',
        token: 'trello-token',
      })
      .reply(200, {
        id: '560bf48efe2771efe9b45987',
        name: 'image.jpg',
        idCard: '560bf48efe2771efe9b45997',
        url: 'https://google.com',
      });
    const request = createServer((req, res) => res.json(req.file));
    return request.post('/upload')
      .attach('picture', path.join(__dirname, 'files', 'image.jpg'))
      .expect(200)
      .then(() => {
        expect(scope.isDone()).to.eql(true);
      });
  });

  it('should throw an error when unauthorized', () => {
    const scope = nock('https://api.trello.com/1')
      .post('/cards', {name: 'image.jpg'})
      .query({
        idList: 'list-id',
        key: 'trello-key',
        token: 'trello-token',
      })
      .reply(401);
    const request = createServer();
    return request.post('/upload')
      .attach('picture', path.join(__dirname, 'files', 'image.jpg'))
      .expect(401)
      .then(() => {
        expect(scope.isDone()).to.eql(true);
      });
  });

  it('should throw an error when timeout', () => {
    const scope = nock('https://api.trello.com/1')
      .post('/cards', {name: 'image.jpg'})
      .query({
        idList: 'list-id',
        key: 'trello-key',
        token: 'trello-token',
      })
      .replyWithError('timeout');
    const request = createServer();
    return request.post('/upload')
      .attach('picture', path.join(__dirname, 'files', 'image.jpg'))
      .expect(500)
      .then(() => {
        expect(scope.isDone()).to.eql(true);
      });
  });
});
