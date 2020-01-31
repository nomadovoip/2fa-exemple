var express = require('express');
var router = express.Router();
var nomado = require('nomado')

var myNomado = new nomado({
  USERNAME: process.env.NOMADO_USER,
  PASSWORD: process.env.NOMADO_PASSWORD
});

/* Formulaire de départ, demande du numéro de téléphone . */
router.get('/', function(req, res, next) {
  res.render('index');
});

/* Deuxième étape, vérification du numéro de téléphone et envoi du code par sms */
router.post('/step2', async function(req, res, next) {
  if (req.body.number) {
    // TODO: vérifier la structure du numéro de téléphone

    try {
      await myNomado.otp.create({
        to: req.body.number,
        template: 'Votre code de vérification est {{CODE}}'
      });
    } catch(error) {
      console.log(error)
      return res.render('index', { error: error.reason });
    }

    res.render('step2', { number: req.body.number });
  } else {
    res.render('index', { error: 'Numéro de téléphone manquant' });
  }
});

/* Troisème étape, vérification du code */
router.post('/step3', async function(req, res, next) {
  if (req.body.number && req.body.code) {

    try {
      const result = await myNomado.otp.verify({
        number: req.body.number,
        token: req.body.code
      });
      if (result.verify) {
        return res.render('step3');
      } else {
        res.render('step2', { number: req.body.number, error: 'Code incorrect' });
      }
    } catch(error) {
      console.log(error);
      return res.render('index', { error: error.reason });
    }

  } else {
    res.render('step2', { number: req.body.number, error: 'Paramètres manquants' });
  }
});

module.exports = router;
