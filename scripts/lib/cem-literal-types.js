/**
 * Resolves a property's TypeScript type to its literal values.
 *
 * The analyzer writes the name of an alias into the manifest (`Appearance`),
 * which tells a linter or an editor nothing. The type checker knows the values,
 * including unions of aliases and `typeof LIST[number]`.
 */

import ts from 'typescript';

export function createLiteralTypeResolver(paths) {
	const program = ts.createProgram(paths.filter((path) => path.endsWith('.ts')), {
		target: ts.ScriptTarget.ESNext,
		module: ts.ModuleKind.ESNext,
		moduleResolution: ts.ModuleResolutionKind.Bundler,
		experimentalDecorators: true,
		noEmit: true,
		skipLibCheck: true,
	});
	const checker = program.getTypeChecker();

	const findClass = (path, className) =>
		program
			.getSourceFile(path)
			?.statements.find((node) => ts.isClassDeclaration(node) && node.name?.text === className);

	/** @returns {string | undefined} `'a' | 'b'`, or undefined when the type is open. */
	return function literalType(path, className, fieldName) {
		const declaration = fieldName && findClass(path, className);
		if (!declaration) return undefined;
		// Through the class type, so a property from a base class or mixin resolves too.
		const property = checker.getTypeAtLocation(declaration).getProperty(fieldName);
		if (!property) return undefined;
		const type = checker.getTypeOfSymbolAtLocation(property, declaration);
		const members = type.isUnion() ? type.types : [type];
		const present = members.filter(
			(member) => !(member.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Null)),
		);
		const isLiteral = (member) => member.isStringLiteral() || member.isNumberLiteral();
		if (present.length === 0 || !present.every(isLiteral)) return undefined;
		return present
			.map((member) => (member.isStringLiteral() ? `'${member.value}'` : String(member.value)))
			.sort()
			.join(' | ');
	};
}
