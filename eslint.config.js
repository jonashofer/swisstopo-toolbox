// @ts-check

const { defineConfig } = require("eslint/config");

// Allows us to bring in the recommended core rules from eslint itself
const eslint = require("@eslint/js");

// Allows us to bring in the recommended rules for TypeScript projects from typescript-eslint
const tseslint = require("typescript-eslint");

// Allows us to bring in the recommended rules for Angular projects from angular-eslint
const angular = require("angular-eslint");

module.exports = defineConfig(
	{
		ignores: ['.angular/**'],
		// Everything in this config object targets our TypeScript files (Components, Directives, Pipes etc)
		files: ["**/*.ts"],
		extends: [
			// Apply the recommended core rules
			eslint.configs.recommended,
			// Apply the recommended TypeScript rules
			...tseslint.configs.recommended,
			// Optionally apply stylistic rules from typescript-eslint that improve code consistency
			...tseslint.configs.stylistic,
			// Apply the recommended Angular rules
			...angular.configs.tsRecommended,
		],
		// Set the custom processor which will allow us to have our inline Component templates extracted
		// and treated as if they are HTML files (and therefore have the .html config below applied to them)
		processor: angular.processInlineTemplates,
		// Override specific rules for TypeScript files (these will take priority over the extended configs above)
		rules: {
			"@angular-eslint/directive-selector": [
				"error",
				{
					type: "attribute",
					prefix: "app",
					style: "camelCase",
				},
			],
			"@angular-eslint/component-selector": [
				"error",
				{
					type: "element",
					prefix: "app",
					style: "kebab-case",
				},
			],
			"@angular-eslint/prefer-inject": "off",
			"@angular-eslint/prefer-on-push-component-change-detection": "off",
			"no-unused-vars": "off",
			"@typescript-eslint/no-unused-vars": [
				"error",
				{
					argsIgnorePattern: "^_",
					varsIgnorePattern: "^_",
					caughtErrorsIgnorePattern: "^_",
				},
			],
		},
	},
	{
		// Everything in this config object targets our HTML files (external templates,
		// and inline templates as long as we have the `processor` set on our TypeScript config above)
		files: ["**/*.html"],
		extends: [
			// Apply the recommended Angular template rules
			...angular.configs.templateRecommended,
			// Apply the Angular template rules which focus on accessibility of our apps
			...angular.configs.templateAccessibility,
		],
		rules: {},
	},
);
