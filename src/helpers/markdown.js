import { Link } from 'react-router-dom';
import { myFetch } from './fetch';
import InfoBlock from "../components/InfoBlock";

export const loadMarkdown = (filename) => {
  const mdPromise = myFetch(filename + ".md", {
    headers: {
      "Content-Type": "text/markdown",
      Accept: "text/markdown",
    },
  }).then((response) => response.text());

  return mdPromise;
};

/* Helper for rendering links using react-router (Link) when applicable
 * For "non-Link" links two variants exists:
 * 1. refs to an "id" (#) on the same page (cross-ref within a md-file)
 * 2. refs to (app-)external sources
 * 
 * All external refs will be opened in a new tab.
 * [https://github.com/remarkjs/react-markdown/issues/29]
 * [https://html.spec.whatwg.org/multipage/links.html]
 */
export const linkRenderer = (props) => {
  return (
    props.href.match(/^\//)
      ? <Link to={props.href}>{props.children}</Link>
      : (props.href.match(/^#/)
        ? <a href={props.href}>{props.children}</a>
        : <a href={props.href} target="_blank" rel="noreferrer">{props.children}</a>
        )
  )
}

/* Helper for creating linkable ("anchor-like") headings
 * Inspired by: https://developers.google.com/style/headings-targets
 *
 * Support two different techniques (whitespace-variations not shown here)
 * 1. {:#my-chosen-id}
 * 2. {:id="my-chosen-id"}
 * Then, we also make the ":" optional
 *  Q: Why so many variants?
 *  A: No clear "standard", e.g.
 *     - VsCode's built-in preview works with #2 above
 *     - But google clearly favors #1
 *
 * Markdown example:
 *   Se the [other section](#another-heading) for details.
 *   ...
 *   ## Another level2 heading {:#another-heading}
 *   Test text
 */
export const headingRenderer = (props) => {
  // Access actual (string) value of heading
  let heading = props.children[0].props.value;
  
  //Can there ever be multiple children?
  // - What does the markdown look like then?
  // - Don't support that for now

  // Check if any anchor definition is present
  let id = null;
  if (typeof heading === 'string') {
    const regex1 = /\{\s*:?\s*#([a-z0-9-]+)\s*\}/;
    const regex2 = /\{\s*:?\s*id\s*=\s*"([a-z0-9-]+)"\s*\}/;
    const found = heading.match(regex1) || heading.match(regex2);
    if (found) {
      id = found[1];
      heading = heading.substring(0,found.index) //only keep the "real heading" part
    }
  }
  
  switch (props.level) {
    case 1:
      return <h1 id={id}>{heading}</h1>;
    case 2:
      return <h2 id={id}>{heading}</h2>;
    case 3:
      return <h3 id={id}>{heading}</h3>;
    case 4:
      return <h4 id={id}>{heading}</h4>;
    case 5:
      return <h5 id={id}>{heading}</h5>;
    default:
      return <h6 id={id}>{heading}</h6>;
  }
}

/* Enbable usage of the App's InfoBlocks by "hijacking" <blockquotes>
 */
export const blockquoteRenderer = (props) => {
  return <InfoBlock>{props.children}</InfoBlock>
}