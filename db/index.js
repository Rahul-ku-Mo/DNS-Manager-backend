const {
  PrismaClient,
  PrismaClientKnownRequestError,
} = require("@prisma/client");

const prisma = new PrismaClient();

module.exports = { prisma, PrismaClientKnownRequestError };
