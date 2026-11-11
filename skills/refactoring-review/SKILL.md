---
name: refactoring-review
description: This skill reviews code for potential refactoring opportunities and suggests improvements.
--

Please review all of the code in this PR. We want all of our code to clearly express it's intent, be easy to read and understand, and be as concise as possible. What, if any of the code in this PR needs improvement in this regard. Focus on the most complex sections of code. Note any names of variables or functions that don't clearly convey their purpose. For any comments, ask yourself if there is a way to refactor the code in such a way that the code itself became so obvious and clear that the comment was no longer needed. Be sure to read both tests and implementation, as readability and maintainablity of both is equally important. We want only the amout of tests necessary to specify the behaviour of our code, if there are more tests than necessary suggest ways to consolidate or eliminate them.
