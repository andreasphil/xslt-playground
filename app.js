import { useThemeColor } from "@andreasphil/design-system/scripts/utils.js";
import {
  computed,
  createApp,
  defineComponent,
  onMounted,
  ref,
  watch,
} from "vue";

/* -------------------------------------------------- *
 * Components                                         *
 * -------------------------------------------------- */

const App = defineComponent({
  setup() {
    const xml = ref("");
    const xslt = ref("");

    const parser = new DOMParser();
    const processor = new XSLTProcessor();

    const output = computed(() => {
      // Parse and generate stylesheet from string
      processor.reset();
      const xsltDoc = parser.parseFromString(xslt.value, "text/xml");
      processor.importStylesheet(xsltDoc);

      // Generate and transform XML
      const xmlDoc = parser.parseFromString(xml.value, "text/xml");
      const output = processor.transformToDocument(xmlDoc);

      console.log("Transformation output", output);

      return output ? output.querySelector("body").innerHTML : "";
    });

    /* -------------------------------------------------- *
     * Serializing and restoring state from the URL       *
     * -------------------------------------------------- */

    watch(
      () => [xml.value, xslt.value],
      () => {
        const xmlState = btoa(xml.value);
        const xsltState = btoa(xslt.value);
        const stateQuery = new URLSearchParams({ xmlState, xsltState });
        const nextLocation = new URL(location.href);
        nextLocation.search = stateQuery;

        history.replaceState({}, "", nextLocation);
      }
    );

    onMounted(() => {
      const state = new URLSearchParams(location.search);
      xml.value = atob(state.get("xmlState") ?? "");
      xslt.value = atob(state.get("xsltState") ?? "");
    });

    /* -------------------------------------------------- *
     * Other setup                                        *
     * -------------------------------------------------- */

    onMounted(() => {
      useThemeColor();
    });

    return { name, xml, xslt, output };
  },

  template: `
    <main class="editors">
      <div class="editor xml">
        <label>XML
          <textarea v-model="xml" />
        </label>
      </div>

      <div class="editor xslt">
        <label>XSLT
          <textarea class="editor xslt" v-model="xslt" />
        </label>
      </div>

      <div class="result">
        <label>Output
          <div data-with-fallback class="output-wrapper">
            <output data-trim="both" v-html="output" />
            <div data-when="empty">
              <strong>Nothing to show 🫤</strong>
              <p>There might be an error in your XML or XSLT. Check the console for details.</p>
            </div>
          </div>
        </label>
      </div>
    </main>
  `,
});

/* -------------------------------------------------- *
 * App                                                *
 * -------------------------------------------------- */

createApp(App).mount("#app");
