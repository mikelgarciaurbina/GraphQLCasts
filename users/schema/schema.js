const graphql = require('graphql');
const axios = require('axios');

const {
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} = graphql;

const CompanyType = new GraphQLObjectType({
  name: 'Company',
  fields: () => ({
    description: { type: GraphQLString },
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    users: {
      type: new GraphQLList(UserType),
      resolve(parent, args) {
        return axios
          .get(`http://localhost:3000/companies/${parent.id}/users`)
          .then(resp => resp.data);
      },
    },
  }),
});

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    age: { type: GraphQLInt },
    company: {
      type: CompanyType,
      resolve(parent, args) {
        return axios
          .get(`http://localhost:3000/companies/${parent.companyId}`)
          .then(resp => resp.data);
      },
    },
    id: { type: GraphQLString },
    firstName: { type: GraphQLString },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    user: {
      type: UserType,
      args: {
        id: { type: GraphQLString },
      },
      resolve(parent, args) {
        return axios
          .get(`http://localhost:3000/users/${args.id}`)
          .then(resp => resp.data);
      },
    },
    company: {
      type: CompanyType,
      args: {
        id: { type: GraphQLString },
      },
      resolve(parent, args) {
        return axios
          .get(`http://localhost:3000/companies/${args.id}`)
          .then(resp => resp.data);
      },
    },
  },
});

const mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    addUser: {
      type: UserType,
      args: {
        age: { type: new GraphQLNonNull(GraphQLInt) },
        companyId: { type: GraphQLString },
        firstName: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve(parent, { age, firstName }) {
        return axios
          .post('http://localhost:3000/users', { age, firstName })
          .then(resp => resp.data);
      },
    },
    deleteUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve(parent, args) {
        return axios
          .delete(`http://localhost:3000/users/${args.id}`)
          .then(resp => resp.data);
      },
    },
    editUser: {
      type: UserType,
      args: {
        age: { type: GraphQLInt },
        companyId: { type: GraphQLString },
        firstName: { type: GraphQLString },
        id: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve(parent, args) {
        return axios
          .patch(`http://localhost:3000/users/${args.id}`, args)
          .then(resp => resp.data);
      },
    },
  }),
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation,
});
