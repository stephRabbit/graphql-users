/**
 * User
 * @property id - id
 * @property firstName - String
 * @property company_id - id
 * @property position_id - id
 * @property users - [id]
 *
 * Company
 * @property id - id
 * @property name - String
 * @property description - String
 *
 * Position
 * @property id - id
 * @property name - String
 * @property description - String
 */

const graphql = require('graphql')
const axios = require('axios')
const {
  GraphQLInt,
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema
} = graphql

// Instructs GQL presence of Company: { id, name, description }
const CompanyType = new GraphQLObjectType({
  name: 'Company',
  fields: {
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    description: { type: GraphQLString }
  }
})

// Instructs GQL presence of User: { id, firstName, age }
const UseType = new GraphQLObjectType({
  name: 'User',
  fields: {
    id: { type: GraphQLString },
    firstName: { type: GraphQLString },
    age: { type: GraphQLInt },
    company: {
      type: CompanyType,
      resolve(parentValue, args) {
        console.log('parentValue: ', parentValue)
        console.log('args: ', args)
        return axios.get(`http://localhost:3000/companies/${parentValue.companyId}`)
          .then(resp => resp.data)
      }
    }
  }
})

// Root query entry point into data graph
const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    user: {
      type: UseType,
      args: { id: { type: GraphQLString } },
      // Access DB or Data store find data
      resolve(parentValue, args) {
        return axios.get(`http://localhost:3000/users/${args.id}`)
          .then(resp => resp.data)
      }
    }
  }
})

// Takes RootQuery and returns GraphQL schema instance
module.exports = new GraphQLSchema({
  query: RootQuery
})