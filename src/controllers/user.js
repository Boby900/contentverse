export const getUser = async (req, res, next) => {
    console.log(req.body);
    res.status(201).send('Hello user!');
};
export const createUser = async (req, res, next) => {
    console.log(req.body);
    res.status(201).send('Hello like');
};
