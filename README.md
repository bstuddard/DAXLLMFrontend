### Running the frontend
npm install
npm run dev

### Overall project structure
Mostly standard view project, a couple of callouts:
- Tailwind used for styling
- index.html: contains a basic csp for security, could be further restricted or modified where needed.
- No auth used as a sample app. In a production app you'd want to implement full user auth. 
- src/views: Simple full page files used in routes. 
- src/components: Most of the logic/styling done here. chat/ChatPageStructure.vue has the bulk of the logic.
- src/composables: Helpers for things like API calls (streaming and standard) + some helpers for local caching and PBIT parsing.
- Sample PBIT file stored in src/assets/contoso.pbit. Can be used for testing purposes when uploading a pbit file. 