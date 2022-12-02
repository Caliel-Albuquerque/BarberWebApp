const express = require ('express')
const app = express()
const hbs = require('express-handlebars')
const bodyParser = require('body-parser')

// Importar model Cliente
const Cliente = require('./models/Cliente')
const Usuario = require('./models/Usuario')
const Servico = require('./models/Servico')
const Atendimento = require('./models/Atendimento')

// Configuração do Handlebars
app.engine('hbs', hbs.engine({
    extname: 'hbs', 
    defaultLayout: 'main'
}))

app.set('view engine', 'hbs')

app.use(express.static('public'))

app.use(bodyParser.urlencoded({extended:false}))

/* ROTAS */

/* INICIO GET INDEX */
app.get('/', (req, res) => {
    res.render('login')
})

/* INICIO GET NOVO USUARIO */
app.get('/novoUsuario', (req, res) => {
    res.render('novoUsuario')
})
/* FIM GET NOVO USUARIO */

app.post('/cadUsuario', (req, res) => {
    let nome = req.body.nome
    let tel = req.body.telefone
    let email = req.body.email
    let senha = req.body.senha

    //Array que vai conter os erros
    const erros = []

    //Validação dos Campos
    
    /* Remover espaços em branco */
    nome = nome.trim()
    email = email.trim()
    tel = tel.trim()
    senha = senha.trim()

    /* Limpar caracteres especiais */
    nome = nome.replace(/[^A-zÀ-ú\s]/gi, '')
    nome = nome.trim()

    /* Verificar se está vazio ou não definido */
    if (nome == '' || typeof nome == undefined || nome == null) {
        erros.push({mensagem: "Campo nome não pode ser vazio!"})
    }

    /* Verificar se campo nome é válido (apenas letras)*/
    if(!/^[A-Za-záàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ\s]+$/.test(nome)) {
        erros.push({mensagem:"Nome Inválido!"})
   }
   
   /* Verificar se está vazio ou não definido */
    if (email == '' || typeof email == undefined || email == null) {
        erros.push({mensagem: "Campo email não pode ser vazio!"})
    }

    /* Verificar se campo email é válido*/
    if (/^[a-z0-9.]+@[a-z0-9]+\.[a-z]+\.([a-z]+)?$/i.test(email)) {
        erros.push({mensagem:"Campo email Inválido!"})
    }

    if(erros.length > 0) {
        return res.redirect('/login')
    }

    //Sucesso (Nenhum Erro) - Salvar no BD
    Usuario.create({
        nome: nome,
        telefone: tel,
        email: email.toLowerCase(),
        senha: senha
    }).then(function() {
        console.log('Cadastrado com sucesso!') 
        return res.redirect('/home')
    }).catch(function(err) {
        console.log(`Ops, houve um erro: ${err}`)
        res.redirect('/novoUsuario')
    })
})

app.get('/home', (req, res) => {
    res.render('index')
})
/* FIM GET INDEX */


/* INICIO GET SERVICOS */
app.get('/servicos', async (req, res) => {
    const { count, rows } = await Servico.findAndCountAll()
    let numServicos = count

    await Servico.findAll()
    .then((servicos) => {
        res.render('servicos', { 
            servicos: servicos.map((servicos) => servicos.toJSON() ),
            numServicos: numServicos
         })
    })
    .catch((err) => console.log(err))
})
/* FIM GET SERVICOS */


/* INICIO GET NOVO SERVICO */
app.get('/novoservico', (req, res) => {
    res.render('novoServico')
})
/* FIM GET NOVO SERVICO */

/* INICIO POST SERVICOS */
app.post('/cadServico', (req, res) => {
    //Valores vindos do formulário
    let nome = req.body.nome
    let valor = req.body.valor

    let erros = []

    /* Remover espaços em branco */
    nome = nome.trim()

    /* Limpar caracteres especiais */
    nome = nome.replace(/[^A-zÀ-ú\s]/gi, '')
    nome = nome.trim()

    /* Verificar se está vazio ou não definido */
    if (nome == '' || typeof nome == undefined || nome == null) {
        erros.push({mensagem: "Campo nome não pode ser vazio!"})
    }

    /* Verificar se campo nome é válido (apenas letras)*/
    if(!/^[A-Za-záàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ\s]+$/.test(nome)) {
        erros.push({mensagem:"Nome Inválido!"})
   }
   
   /* Verificar se está vazio ou não definido */
    if (valor == '' || typeof valor == undefined || valor == null) {
        erros.push({mensagem: "Campo valor não pode ser vazio!"})
    }

    //Sucesso (Nenhum Erro) - Salvar no BD
    Servico.create({
        nome: nome,
        valor: valor
    }).then(function() {
        console.log('Cadastrado com sucesso!') 
        return res.redirect('/servicos')
    }).catch(function(err) {
        console.log(`Ops, houve um erro: ${err}`)
    })
})
/* FIM POST SERVICOS */

// INICIO GET EDITAR-SERVICO
app.post('/editarServico', (req, res) => {
    let idServico = req.body.idServico
    Servico.findByPk(idServico).then((dados) => {
        return res.render('editarServico', {
            error: false, 
            idServico: dados.idServico, 
            nome: dados.nome, 
            valor: dados.valor
        })
    }).catch((err) => {
        console.log(err)
        return res.render('editarServico', {
            error: true, 
            problema: 'Não é possível editar esse registro!'
        })
    })
})
// FIM GET EDITAR-SERVICO

// INICIO PUT EDITAR-SERVICO
app.post('/updateServico', (req, res) => {
    let body = req.body
    console.log(body)
    //Valores vindos do formulário
    let nome = req.body.nome
    let valor = req.body.valor

    let erros = []

    /* Remover espaços em branco */
    nome = nome.trim()

    /* Limpar caracteres especiais */
    nome = nome.replace(/[^A-zÀ-ú\s]/gi, '')
    nome = nome.trim()

    /* Verificar se está vazio ou não definido */
    if (nome == '' || typeof nome == undefined || nome == null) {
        erros.push({mensagem: "Campo nome não pode ser vazio!"})
    }

    /* Verificar se campo nome é válido (apenas letras)*/
    if(!/^[A-Za-záàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ\s]+$/.test(nome)) {
        erros.push({mensagem:"Nome Inválido!"})
   }
   
   /* Verificar se está vazio ou não definido */
    if (valor == '' || typeof valor == undefined || valor == null) {
        erros.push({mensagem: "Campo valor não pode ser vazio!"})
    }

    Servico.update({
        nome: nome,
        valor: valor
    },
    {
        where: {
            idServico: req.body.idServico
        }
    }).then((resultado) => {
        console.log(resultado)
        return res.redirect('/servicos')
    }).catch((err) => {
        console.log(err)
    })
})
// FINAL PUT EDITAR-SERVICO

/* INICIO DELETE SERVICO */
app.post('/deletarServico', (req, res) => {
    let idServico = req.body.idServico
    Servico.destroy({
        where:{
            idServico: idServico
        }
    }).then(() => {
        return res.redirect('/servicos')
    }).catch((err) => {
        console.log(err)
    })
})

/* INICIO GET CLIENTES */
app.get('/clientes', async (req, res) => {
    const { count, rows } = await Cliente.findAndCountAll()
    let numClientes = count

    await Cliente.findAll()
    .then((cliente) => {
        res.render('clientes', { 
            cliente: cliente.map((clientes) => clientes.toJSON() ),
            numCliente: numClientes
         })
    })
    .catch((err) => console.log(err))
})
/* INICIO GET NOVOCLIENTE */
app.get("/novocliente", (req, res) => {
    res.render("novoCliente")
})
/* INICIO POST CLIENTES */
app.post('/cadCliente', (req, res) => {
    //Valores vindos do formulário
    let nome = req.body.nomeCliente
    let celularCliente = req.body.celularCliente
    let aniversarioCliente = req.body.nascimentoCliente
    let emailCliente = req.body.emailCliente

    let erros = []

    /* Remover espaços em branco */
    nome = nome.trim()

    /* Limpar caracteres especiais */
    nome = nome.replace(/[^A-zÀ-ú\s]/gi, '')
    nome = nome.trim()

    /* Verificar se está vazio ou não definido */
    if (nome == '' || typeof nome == undefined || nome == null) {
        erros.push({mensagem: "Campo nome não pode ser vazio!"})
    }

    /* Verificar se campo nome é válido (apenas letras)*/
    if(!/^[A-Za-záàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ\s]+$/.test(nome)) {
        erros.push({mensagem:"Nome Inválido!"})
   }
   
   /* Verificar se está vazio ou não definido */
    if (celularCliente == '' || typeof celularCliente == undefined || celularCliente == null) {
        erros.push({mensagem: "Campo valor não pode ser vazio!"})
    }

    if (aniversarioCliente == '' || typeof aniversarioCliente == undefined || aniversarioCliente == null) {
        erros.push({mensagem: "Campo valor não pode ser vazio!"})
    }

    if (emailCliente == '' || typeof emailCliente == undefined || emailCliente == null) {
        erros.push({mensagem: "Campo valor não pode ser vazio!"})
    }

    //Teste Email  
    var re = /\S+@\S+\.\S+/; 

    if(re.test(emailCliente) == false){
        erros.push({mensagem: "Email invalido"})
    }
    

    //Sucesso (Nenhum Erro) - Salvar no BD
    Cliente.create({
        nome: nome,
        telefone: celularCliente,
        email: emailCliente,
        data_nasc: aniversarioCliente 
    }).then(function() {
        console.log('Cadastrado com sucesso!') 
        return res.redirect('/clientes')
    }).catch(function(err) {
        console.log(`Ops, houve um erro: ${err}`)
    })
})
/* FIM POST CLIENTES */

/* INICIO DELETE CLIENTE */
app.post('/deletarCliente', (req, res) => {
    let idCliente = req.body.idCliente
    Cliente.destroy({
        where:{
            idCliente: idCliente
        }
    }).then(() => {
        return res.redirect('/clientes')
    }).catch((err) => {
        console.log(err)
    })
})

/* INICIO GET ATENDIMENTO */ 
app.get("/atendimento", async (req, res) => {
    

    await Servico.findAll()
    .then((servicos) => {
        res.render('venda', { 
            servicos: servicos.map((servicos) => servicos.toJSON() ),
            
         })
    })
    .catch((err) => console.log(err))
})

//Inicialização do Servidor
app.listen(3000, () => {
    console.log('Aplicação rodando na porta 3000!')
})