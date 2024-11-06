export const getHome = async (req, res, next) => {
    console.log(req.body);
    res.status(201).send('Hello World!');
};
export const likePost = async (req, res, next) => {
    console.log(req.body);
    res.status(201).send('Hello like');
};
export const deletePost = async (req, res, next) => {
    console.log(req.body);
    res.status(201).send('Hello delete!');
};
export const createPost = async (req, res, next) => {
    console.log(req.body);
    res.status(201).send('Hello create!');
};
