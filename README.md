## CTCon UI
A Contentstack app with a Full Page UI Location for managing cross-stack content types.

Expectation: 
In a multistack approach, the same app/extension will be installed in multiple stacks. When keeping content types in sync, it's necessary to change the app/extension uids in the content type schemas to ensure that the fields point to the app/extension installation in the target stack(s).

This tool requires management access to each stack (source and targets). This can be established in several ways. This implementation uses OAuth to authenticate, which provides security and mitigates the need to authenticate manually against each stack.

Usage:
Install the app [as outlined here](https://www.contentstack.com/docs/developers/developer-hub/creating-an-app-in-developer-hub). Create a Full Page UI Location that points to the /ctcon path in this project.

The tool first gets all content types AND global fields from the stack that use apps/extensions, along with a list of apps/extensions installed in the stack. Addressing a significant limitation from the cli tool, this implementation stringifies the schema to search for any instance of "extension_uid" regardless of nesting in groups or modular blocks. Once a content type or global field is selected, the UI will indicate which apps/extensions are used.

The tool fetches a list of stacks that also have the CTCon app installed. This isn't necessary at all, but implemented primarily as a convenience in a crowded stack environment. The tool could simply get all stacks in the organization. It then presents a series of buttons that allow the user to download JSON files representing the schema of the selected content type/global field with the app/extension uids replaced. These JSON files can then be imported into the target stack in the Contentstack UI.

Limitations:
This tool doesn't automatically update the content type/global field in the target stack. That would be a huge effiency win. The code also needs some refactoring for better legibility and possibly UI improvements.