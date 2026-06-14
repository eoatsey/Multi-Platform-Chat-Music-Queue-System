const express = require('express');
const router = express.Router();
const { getQueue } = require('../services/queueService');
const { getBroadcastList } = require('../services/broadcastService');

router.get('/queue', (req, res) => res.json(getQueue()));
router.get('/broadcasts', (req, res) => res.json(getBroadcastList()));

module.exports = router;
