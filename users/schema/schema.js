const graphql = require('graphql');
const axios = require('axios');

const {
  GraphQLInt,
  GraphQLList,
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

module.exports = new GraphQLSchema({
  query: RootQuery,
});
