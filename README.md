[![CircleCI](https://circleci.com/gh/marccampbell/postmark-cli/tree/master.svg?style=svg)](https://circleci.com/gh/marccampbell/postmark-cli/tree/master)

# Postmark CLI

A modern CLI for use in a CI/CD pipeline to push email templates to postmarkapp.com.

## Why?
Logging in to postmarkapp.com and editing email templates there is an antipattern. Everything should be reviewable. When possible, it's good to have a code review process and an automated way to deploy everything, from infrastructure to code and everything in between (including email templates).

## How to start
We recommend setting up a repo similiar to this one
