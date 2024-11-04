module.exports = {
    getHome: async (req, res) => {

            console.log(req.body)
            res.status(201).send('Hello World!')

    },
    createPost: async (req, res) => {
        
        console.log(req.body)
        res.status(201).send('creating the post')
    },
    likePost: async (req, res) => {
        
        console.log(req.body)
        res.status(201).send('liking the post!')
    },
    deletePost: async (req, res) => {
        
        console.log(req.body)
        res.status(201).send('deleting the post!')
    },

}
