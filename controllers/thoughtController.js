const { Thought, User } = require('../models');

module.exports = {
   getAllThoughts(req, res) {
      Thought.find()
         .then((thoughts) => res.json(thoughts))
         .catch((err) => res.status(500).json(err));
   },

   getSingleThought(req, res) {
      Thought.findOne({ _id: req.params.thoughtId })
         .then((thought) =>
            !thought
               ? res.status(404).json({ message: 'No thought with that ID' })
               : res.json(thought)
         )
         .catch((err) => res.status(500).json(err));
   },

   createThought(req, res) {
      let thoughtId;
      Thought.create(req.body)
         .then((thought) => {
            thoughtId = thought._id;
            User.findOneAndUpdate(
               { username: req.body.username },
               { $addToSet: { thoughts: thought._id } },
               { new: true }
            )
            .then((user) => {
               if (!user) {
                  Thought.findOneAndRemove({ _id: thoughtId})
                  .catch((err) => res.status(500).json(err));
                  res.status(404).json({ message: 'No user with that username, thought deleted' })
               } else {
                  res.json({ message: 'Thought created' })
               }
            })
            .catch((err) => {
               console.log(err);
               res.status(500).json(err);
            });
         }
         )
         .catch((err) => {
            console.log(err);
            res.status(500).json(err);
         });
   },

   updateThought(req, res) {
      Thought.findOneAndUpdate(
         { _id: req.params.thoughtId },
         { $set: req.body },
         { runValidators: true, new: true }
      )
         .then((thought) =>
            !thought
               ? res.status(404).json({ message: 'No thought with this id!' })
               : res.json(thought)
         )
         .catch((err) => {
            console.log(err);
            res.status(500).json(err);
         });
   },

   deleteThought(req, res) {
      Thought.findOneAndRemove({ _id: req.params.thoughtId })
         .then((thought) =>
            !thought
               ? res.status(404).json({ message: 'No thought with this id!' })
               : User.findOneAndUpdate(
                  { thoughts: req.params.thoughtId },
                  { $pull: { thoughts: req.params.thoughtId } },
                  { new: true }
               )
         )
         .then((user) => res.json({ message: 'Thought deleted' })
         )
         .catch((err) => res.status(500).json(err));
   },

   addReaction(req, res) {
      Thought.findOneAndUpdate(
          { _id: req.params.thoughtId },
          { $addToSet: { reactions: req.body } },
          { new: true },
      )
      .then((foundThought) => {
          !foundThought
              ? res.status(404).json({ msg: "No thought with that ID" })
              : res.json(foundThought)
      })
      .catch((err) => {
          console.log(err);
          res.status(500).json(err);
      });        
  },

  removeReaction(req, res) {
      Thought.findOneAndUpdate(
          { _id: req.params.thoughtId },
          { $pull: { reactions: { reactionId: req.params.reactionId } } },
          { new: true },
      )
      .then((foundReaction) => {
          !foundReaction
              ? res.status(404).json({ msg: "No thought with that ID" })
              : res.json(foundReaction)
      })
      .catch((err) => {
          console.log(err);
          res.status(500).json(err);
      });        
  }
};