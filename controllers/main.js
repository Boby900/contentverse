module.exports = {
    getHome: async (req, res) => {

            console.log(req.body)
            res.status(201).send('Hello World!')

    }

}
