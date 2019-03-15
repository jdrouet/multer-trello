# Multer Trello

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![codecov](https://codecov.io/gh/jdrouet/multer-trello/branch/master/graph/badge.svg)](https://codecov.io/gh/jdrouet/multer-trello)
[![CircleCI Build Status](https://circleci.com/gh/jdrouet/multer-trello.svg?style=shield)](https://circleci.com/gh/jdrouet/multer-trello)
[![Greenkeeper badge](https://badges.greenkeeper.io/jdrouet/multer-trello.svg)](https://greenkeeper.io/)

This project is mostly a proof of concept. It's not made to be used in production.

## Installation

```bash
npm install --save multer-trello
```

## Usage

```node
const express = require('express');
const multer = require('multer');
const {TrelloStorage} = require('multer-trello');

const app = express();
const uploader = multer({
  storage: new TrelloStorage({
    key: 'trello-key',
    token: 'trello-token',
    board: 'board id',
    list: 'list id',
  }),
});

app.post('/upload', uploader.single('picture'), (req, res) => {
  res.json(req.file);
});
```
