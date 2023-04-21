const {CoreClass} = require('@bot-whatsapp/bot')
const dbConnect = require('../utils/dbConnect')
const Product = require('../models/products')
const {findMostSimilarString, limpiarCadena} = require('../helpers/modifyStrings')

let products
dbConnect()

async function getProducts () {
  products = await Product.find()
}

getProducts()

class GPT extends CoreClass {

  history = []
  optionsGPT = {
    model: 'gpt-3.5-turbo',
    temperature: 1,
  }
  openai = undefined

  constructor(_database, _provider) {
    super(null, _database, _provider)
    this.init().then()
  }

  init = async () => {
    const {ChatGPTAPI} = await import('chatgpt');
    this.openai = new ChatGPTAPI({
      apiKey: process.env.APY_KEY,
      completionParams: this.optionsGPT
    })
  }

  handleMsg = async ({from, body}) => {

    let respuesta
    const ctxGPT = {
      // conversationId: (!this.history.length) ? undefined : this.history[this.history.length - 1].id,
      parentMessageId: (!this.history.length) ? undefined : this.history[this.history.length - 1].parentMessageId,
    }

    const promptInicial = `clasifica el mensaje que te dare entre estas opciones

      - product: si les interesa comprar un producto.
      - ofertas: preguntas relacionadas con ofertas y descuentos.
      - local: preguntas relacionadas con horarios y ubicacion.
      - default: cuando el mensaje no coincide con nada de lo anterior.

      (le respuesta debe ser la palabra de la clasificacion ejemplo: 'product' ademas en caso de product quiero saber que producto estan buscando respetando siempre el siguiente ejemplo: 'product: tintura de pelo') es importante que solo sea el nombre, sin especificaciones como por ejemplo talla y color`
    const completion = await this.openai.sendMessage(promptInicial + "mensaje: " + body)

    if (completion.text.includes('product')) {

      const req = limpiarCadena(completion.text.toLocaleLowerCase().replace('product: ', '').replace('.', ''))
      let minDist = Infinity
      let product

      for (const prod of products) {
        const [text, dist] = findMostSimilarString(req, prod.synonyms)
        if (minDist > dist) {
          minDist = dist
          product = prod
        }
      }

      respuesta = await this.openai.sendMessage(
        `actua como un vendedor profesional y brindale al cliente la informacion del siguiente producto respondiendo a:
           ${body} 
        
        informacion disponible: 
          - ${product.stock > 0 ? 'tenemos stock disponible' : 'no tenemos stock disponible'}
          - ${product.stock > 0 ? 'el valor del producto es de $' + product.price : ''}`,
          ctxGPT
      )
    } 
    else if (completion.text.includes('local')) {
      respuesta = await this.openai.sendMessage('actua como un empleado de atencion al cliente profesional para informar que el horario es de 8HS hasta las 20HS de lunes a viernes y estamos en la calle "San Martin al 1423"', ctxGPT)
    }
    else if (completion.text.includes('ofertas')) {
      respuesta = await this.openai.sendMessage('actua como vendedor profesional para informar que no tenemos ofertas disponibles', ctxGPT)
    }
    else if (completion.text.includes('default')) {
      respuesta = await this.openai.sendMessage('actua como vendedor profesional para informar que somos una tienda de ropa llamada "Estilo Urbano" y que puedes ayudarlo en lo que necesite si es referido a la tienda', ctxGPT)
    }
    
    if (respuesta) {
      this.history.push(respuesta)
  
      const parse = {
        ...respuesta,
        answer: respuesta.text
      }
      this.sendFlowSimple([parse], from)
    }
  }
}

module.exports = GPT
