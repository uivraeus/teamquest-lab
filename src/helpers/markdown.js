import { Link } from 'react-router-dom';

export const loadMarkdown = (filename) => {
  const mdPromise = fetch(filename + ".md", {
    headers: {
      "Content-Type": "text/markdown",
      Accept: "text/markdown",
    },
  }).then((response) => response.text());

  return mdPromise;
};

/* Helper for rendering links using react-router when applicable
 * (TBD: exactly what is desired here... depending on what one would
 * like to represent in the markdown file)
 * [https://github.com/remarkjs/react-markdown/issues/29]
 */
export const linkRenderer = (props) => {
  return (
    props.href.match(/^\//)
      ? <Link to={props.href}>{props.children}</Link>
      : <a href={props.href}>{props.children}</a>
  );
}