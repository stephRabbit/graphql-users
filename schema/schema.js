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
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema
} = graphql

// Instructs GQL presence of Company: { id, name, description }
// Relation single company to multiple users
const CompanyType = new GraphQLObjectType({
  name: 'Company',
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    users: {
      // GraphQLList for multiple users
      type: new GraphQLList(UserType),
      async resolve(parentValue, args) {
        console.log('parentValue: ', parentValue)
        console.log('args: ', args)
        const users = await axios.get(`http://localhost:3000/companies/${parentValue.id}/users`)
        return users.data
      }
    }
  })
})

// Instructs GQL presence of User: { id, firstName, age }
// Relation single user to single company
const UserType = new GraphQLObjectType({
  name: 'User',
  // fields: () => returns an {} - functions gets defined but not executed
  // until entire file gets executed. File gets excuted defines (UserType, CompanyType...)
  // then GraphQL excutes fields with the correct scope
  fields: () => ({
    id: { type: GraphQLString },
    firstName: { type: GraphQLString },
    age: { type: GraphQLInt },
    company: {
      type: CompanyType,
      async resolve(parentValue, args) {
        console.log('parentValue: ', parentValue)
        console.log('args: ', args)
        const company = axios.get(`http://localhost:3000/companies/${parentValue.companyId}`)
        return company.data
      }
    }
  })
})

// Root query entry point into data graph
const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    // Query user
    user: {
      type: UserType,
      args: { id: { type: GraphQLString } },
      // Access DB or Data store find data
      async resolve(parentValue, args) {
        const user = await axios.get(`http://localhost:3000/users/${args.id}`)
        return user.data
      }
    },
    // Query company
    company: {
      type: CompanyType,
      args: { id: { type: GraphQLString } },
      // Access DB or Data store find data
      async resolve(parentValue, args) {
        const company = await axios.get(`http://localhost:3000/companies/${args.id}`)
        return company.data
      }
    }
  }
})

// Root mutation
const mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addUser: {
      type: UserType,
      args: {
        firstName: { type: new GraphQLNonNull(GraphQLString) },
        age: { type: new GraphQLNonNull(GraphQLInt) },
        companyId: { type: GraphQLString }
      },
      async resolve(parentValue, { age, firstName }) {
        const addUser = await axios.post('http://localhost:3000/users', {
          age,
          firstName,
        })
        return addUser.data
      }
    },
    deleteUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) }
      },
      async resolve(parentValue, { id }) {
        const deleteUser = await axios.delete(`http://localhost:3000/users/${id}`, {
          id
        })
        return deleteUser.data
      }
    },
    editUser: {
      type: UserType,
      args: {
        id: { type: GraphQLNonNull(GraphQLString) },
        firstName: { type: GraphQLString },
        age: { type: GraphQLInt },
        companyId: { type: GraphQLString }
      },
      async resolve(parentValue, args) {
        const editUser = await axios.patch(`http://localhost:3000/users/${args.id}`, args)
        return editUser.data
      }
    }
  }
})

// Takes RootQuery and returns GraphQL schema instance
module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation
})