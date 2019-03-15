const debug = require('debug')('multer-trello');
const request = require('request');

const host = 'https://api.trello.com/1';

const handleResponse = (resolve, reject) => (err, res, body) => {
  if (err) return reject(err);
  if (res.statusCode >= 400) {
    const error = new Error(res.statusMessage);
    error.statusCode = res.statusCode;
    return reject(error);
  }
  if (typeof body === 'string') {
    return resolve(JSON.parse(body));
  }
  return resolve(body);
};

class TrelloClient {
  /**
   * @param {object} options options to connect to Trello
   * @param {string} options.key api key to authenticate
   * @param {string} options.token api token to authenticate
   * @param {string} options.board board id where to upload the files
   * @param {string} options.list list id where to upload the files
   */
  constructor(options) {
    this.key = options.key;
    this.token = options.token;
    this.board = options.board;
    this.list = options.list;
  }

  post(uri, options) {
    const url = `${host}${uri}`;
    const qs = Object.assign({}, options.params, {
      key: this.key,
      token: this.token,
    });
    return new Promise((resolve, reject) => {
      request.post({
        url,
        qs,
        body: options.body,
        formData: options.formData,
        json: !!options.body,
      }, handleResponse(resolve, reject));
    });
  }

  // remove(uri, options = {}) {
  //   const url = `${host}${uri}`;
  //   const qs = Object.assign({}, options.params, {
  //     key: this.key,
  //     token: this.token,
  //   });
  //   return new Promise((resolve, reject) => {
  //     request.delete({
  //       url,
  //       qs,
  //     }, handleResponse(resolve, reject));
  //   });
  // }

  /**
   * @param {string} options.name name of the list to create
   * @param {string} options.list id of the board where to create the list
   */
  // createList(options) {
  //   debug('client.card.create');
  //   return this.post(`/lists`, {
  //     params: {idBoard: options.board},
  //     body: {name: options.name},
  //   });
  // }

  /**
   * @param {object} options options to create a card
   * @param {string} options.name name of the card to create
   * @param {string} options.list id of the list where to create the card
   * @return {Promise} created card
   */
  createCard(options) {
    debug('client.card.create');
    return this.post(`/cards`, {
      params: {idList: options.list},
      body: {name: options.name},
    });
  }

  /**
   * @param {object} options options to add the attachment
   * @param {string} options.name name of the file
   * @param {string} options.card id of the card where to create the attachment
   * @param {string} options.stream stream containing the file
   * @return {Promise} created attachment
   */
  createAttachment(options) {
    debug('client.attachment.create');
    return this.post(`/cards/${options.card}/attachments`, {
      formData: {
        name: options.name,
        file: options.stream,
      },
    });
  }

  /**
   * @param {string} options.card id of the card to delete
   */
  // removeCard(options) {
  //   debug('client.card.delete');
  //   return this.remove(`/cards/${options.card}`);
  // }

  /**
   * @param {string} options.card id of the card containing the attachment
   * @param {string} options.attachment id of the attachment to delete
   */
  // removeAttachment(options) {
  //   debug('client.attachment.delete');
  //   return this.remove(`/cards/${options.card}/${options.attachment}`);
  // }
}

class TrelloStorage extends TrelloClient {
  async _handleFile(req, file, cb) {
    debug('storage._handleFile', file);
    try {
      const card = await this.createCard({
        name: file.originalname,
        list: this.list,
      });
      const attachment = await this.createAttachment({
        card: card.id,
        name: file.originalname,
        stream: file.stream,
      });
      return cb(null, attachment);
    } catch (err) {
      return cb(err);
    }
  }

  // _removeFile(req, file, cb) {
  //   console.log('_removeFile', file);
  //   return cb(null, file);
  // }
}

module.exports = {
  TrelloStorage,
};
