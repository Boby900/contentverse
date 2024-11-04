module.exports = {
    getUser: async (req, res, next) => {
        console.log(req.body)
        res.status(200).send('Hello from the user!')
    
},
createUser: async (req, res, next) => {
    console.log(req.body)
    res.status(200).send('creating the user!')

}
}

