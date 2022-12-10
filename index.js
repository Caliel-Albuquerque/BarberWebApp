const express = require ('express')
const bcrypt = require('bcrypt')
//const jwt = require('jsonwebtoken')
const hbs = require('express-handlebars')
const bodyParser = require('body-parser')
const session = require('express-session')

const app = express()

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
app.use(express.json())
app.use(bodyParser.urlencoded({extended:false}))

//Confuguração das Sessions
app.use(session({
    secret:'123blablabla',
    resave: false,
    saveUninitialized: true
}))

/* ROTAS */
app.get('/', (req, res) => {
    res.render('login', {error: false})
})

// Login de Usuário
app.post('/', async(req, res) => {
    const {email, senha} = req.body

    //Array que vai conter os erros
    let erros = []

    /* Verificar se está vazio ou não definido */
    if (email == '' || typeof email == undefined || email == null) {
        erros.push({mensagem: "Campo email não pode ser vazio!"})
    }
    
    /* Verificar se está vazio ou não definido */
    if (senha == '' || typeof senha == undefined || senha == null) {
        erros.push({mensagem: "Campo senha não pode ser vazio!"})
    }

    // Checar se usuário existe
    const user = await Usuario.findByPk(email)
    
    const userExists = user instanceof Usuario
    
    if (!userExists) {
        erros.push({mensagem:"Email Inválido."})
    } else {
        const userData = user.toJSON()
        // Checar se senha combina
        const checkPassword = await bcrypt.compare(senha, userData.senha)

        if (!checkPassword) {
            erros.push({mensagem: "Senha Inválida."})
        }
    }

    if (erros.length > 0) {
        return res.render('login', {error: true, problemas: erros})
    } else {
        const userData = user.toJSON()
        req.session.userName = userData.nome
        let userName = req.session.userName

        return res.redirect(`/in/${userName}`)
    }

    /*const secret = process.env.SECRET
    const token = jwt.sign(
        {
            id: user.nome
        },
        secret
    )*/

    
})

// Exibir página de cadastro de usuário
app.get('/novoUsuario', (req, res) => {
    res.render('novoUsuario')
})

// Cadastro de Usuário
app.post('/cadUsuario', async(req, res) => {
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

    const user = await Usuario.findByPk(email)
    const userExists = user instanceof Usuario

    if (userExists) {
        erros.push({mensagem:"Por favor, utilize outro email."})
    }

    if(erros.length > 0) {
        return res.redirect('/novoUsuario')
    }

    // Criar senha
    const salt = await bcrypt.genSalt(12)
    const senhaHash = await bcrypt.hash(senha, salt)

    //Sucesso (Nenhum Erro) - Salvar no BD
    await Usuario.create({
        nome: nome,
        telefone: tel,
        email: email.toLowerCase(),
        senha: senhaHash
    }).then(function() {
        console.log('Cadastrado com sucesso!')
        res.redirect('/')
    }).catch(function(err) {
        console.log(`Ops, houve um erro: ${err}`)
        res.redirect('/novoUsuario')
    })
})

// Middleware
/*
function checkToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(" ")[1]

    if (!token) {
        return res.status(401).json({msg: "Acesso negado."})
    }

    try {
        const secret = process.env.SECRET

        jwt.verify(token, secret)

        // Finalizou o middleware
        next()

    } catch(error) {
        res.status(400).json({msg: "Token Inválido."})
    }
}*/

// Exibir página inicial do app
app.get('/in/:nome', (req, res) => {
    const nome = req.params.nome
    res.render('index', {nomeUsuario: nome})
})

// Exibir/listar serviços cadastrados
app.get('/servicos', async(req, res) => {
    const nomeUsuario = req.session.userName
    const { count, rows } = await Servico.findAndCountAll()

    await Servico.findAll()
    .then((servicos) => {
        res.render('servicos', { 
            servicos: servicos.map((servicos) => servicos.toJSON() ),
            numServicos: count,
            nomeUsuario: nomeUsuario
         })
         console.log(nome)
    })
    .catch((err) => console.log(err))
})

app.get('/novoservico', (req, res) => {
    //const nome = req.params.nome
    res.render('novoServico')
})


// Cadastrar novo serviço
app.post('/cadServico', async(req, res) => {
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
    await Servico.create({
        nome: nome,
        valor: valor
    }).then(function() {
        console.log('Cadastrado com sucesso!') 
        return res.redirect(`/servicos`)
    }).catch(function(err) {
        console.log(`Ops, houve um erro: ${err}`)
    })
})

// Exibir serviço a ser editado
app.post('/editarServico', async(req, res) => {
    let idServico = req.body.idServico
    console.log(idServico)
    await Servico.findByPk(idServico).then((dados) => {
        console.log(dados)
        return res.render('editarServico', {
            error: false, 
            idServico: dados.idServico, 
            nome: dados.nome, 
            valor: dados.valor,
        })
    }).catch((err) => {
        //console.log(err)
        return res.render(`editarServico`, {
            error: true, 
            problema: 'Não é possível editar esse registro!',
        })
    })
})

// Editar serviço
app.post('/updateServico', async(req, res) => {
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

    await Servico.update({
        nome: nome,
        valor: valor
    },
    {
        where: {
            idServico: req.body.idServico
        }
    }).then((resultado) => {
        console.log(resultado)
        return res.redirect(`/servicos`)
    }).catch((err) => {
        console.log(err)
    })
})

// Deletar serviço
app.post('/deletarServico', async(req, res) => {
    let idServico = req.body.idServico
    await Servico.destroy({
        where:{
            idServico: idServico
        }
    }).then(() => {
        return res.redirect(`/servicos`)
    }).catch((err) => {
        console.log(err)
    })
})

// Exibir/listar clientes cadastrados
app.get('/clientes', async (req, res) => {
    let nomeUsuario = req.session.userName
    const { count, rows } = await Cliente.findAndCountAll()
    let numClientes = count

    await Cliente.findAll()
    .then((cliente) => {
        res.render('clientes', { 
            cliente: cliente.map((clientes) => clientes.toJSON() ),
            numCliente: numClientes,
            nomeUsuario: nomeUsuario
         })
    })
    .catch((err) => console.log(err))
})

// Exibir página de cadastro de novo cliente
app.get("/novoCliente", (req, res) => {
    res.render("novoCliente")
})

// Cadastro de cliente
app.post('/cadCliente', async(req, res) => {
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
    await Cliente.create({
        nome: nome,
        telefone: celularCliente,
        email: emailCliente,
        data_nasc: aniversarioCliente 
    }).then(function() {
        console.log('Cadastrado com sucesso!') 
        return res.redirect(`/clientes`)
    }).catch(function(err) {
        console.log(`Ops, houve um erro: ${err}`)
    })
})

// Deletar cliente
app.post('/deletarCliente', (req, res) => {
    let idCliente = req.body.idCliente
    Cliente.destroy({
        where:{
            idCliente: idCliente
        }
    }).then(() => {
        return res.redirect(`/clientes`)
    }).catch((err) => {
        console.log(err)
    })
})

// Exibir atendimentos cadastrados
app.get("/atendimento", async (req, res) => {
    
    await Servico.findAll()
    .then((servicos) => {
        res.render('venda', { 
            servicos: servicos.map((servicos) => servicos.toJSON() ),
            
         })
    })
    .catch((err) => console.log(err))
})

//CADASTRO DE ATENDIMENTO

app.post('/cadAtendimento', (req, res) => {
    //Valores vindos do formulário
    let nome = req.body.opcoesServicos
    let valor = req.body.opcoesValor
    let dataNascimento = req.body.dataAtendimento
    let formaPag = req.body.opcoesPagamento

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
        valor: valor,
        data_atendimento: dataNascimento,
        forma_pag: formaPag
    }).then(function() {
        console.log('Cadastrado com sucesso!') 
        return res.redirect('/home')
    }).catch(function(err) {
        console.log(`Ops, houve um erro: ${err}`)
    })
})
/* FIM POST ATENDIMENTO */


//Inicialização do Servidor
app.listen(3000, () => {
    console.log('Aplicação rodando na porta 3000!')
})