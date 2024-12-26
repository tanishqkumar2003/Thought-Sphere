import { Hono } from "hono"
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { verify } from 'hono/jwt'
import { createBlogInput, updateBlogInput } from "tanishqkumar-medium-common";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Resend } from "resend";

export const blogRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string,
    JWT_SECRET: string
  },
  Variables: {
    userId: string,
  }
}>();


blogRouter.use('/*', async (c, next) => {
  const jwt = c.req.header('authorization');
  if (!jwt || !jwt.startsWith('Bearer ')) {
    c.status(403);
    return c.json({
      message: "Invalid Header"
    })
  }

  const token = jwt.split(' ')[1];
  if (!jwt) {
    c.status(401);
    return c.json({ error: "unauthorized" });
  }
  try {
    const payload = await verify(token, c.env.JWT_SECRET);

    if (!payload) {
      c.status(401);
      return c.json({ error: "unauthorized" });
    }
    //@ts-ignore
    c.set('userId', payload.id);
    c.json({
      id: payload.id
    })
    await next();
  } catch (error) {
    return c.json({
      message: "error in jwt verification"
    })
  }
})


blogRouter.post("/create", async (c) => {
  const body = await c.req.json();
  const { success } = createBlogInput.safeParse(body);
  if (!success) {
    c.status(411);
    return c.json({
      message: "Invalid Inputs"
    });
  }

  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const userId = c.get('userId');

  try {
    const post = await prisma.post.create({
      data: {
        title: body.title,
        content: body.content,
        authorId: userId,
        published: body.published,
        author: body.name
      }
    });

    // Email function
    const resend = new Resend('your api');
    const receiver = body.email;

    try {
      const data = await resend.emails.send({
        from: 'ThoughtSphere@webmaven.tech',
        to: receiver,
        subject: '🎉 Blog Created Successfully!',
        html: `
  <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
    <h2 style="color: #4CAF50;">Blog Created Successfully 🎉</h2>
    <p><b>Title:</b> ${body.title}</p>
    <p><b>Status:</b> ${body.published ? "Published" : "Draft"}</p>
    ${body.published ? `<p><b>Published At:</b> ${new Date().toLocaleString()}</p>` : ''}
    <hr />
    <p style="font-size: 0.9em; color: #555;">Thank you for using our platform to share your ideas. We’re excited to see your blog grow!</p>
    <p style="font-size: 0.9em; color: #555;">If you have any questions, feel free to <a href="mailto:ThoughtSphere@webmaven.tech" style="color: #4CAF50;">contact us</a>.</p>
  </div>
`
      });
      console.log(data);
    } catch (emailError) {
      console.error("Error sending email:", emailError);
    }

    return c.json({
      message: "Blog created Successfully",
      id: post.id,
      name: post.authorId
    });
  } catch (error: any) {
    c.status(403);
    return c.json({
      message: "Error creating post",
      error: error.message,
      user: userId
    });
  }
});


blogRouter.put("/update/:id", async (c) => {
  const body = await c.req.json();
  const id = c.req.param('id');
  // const { success } = updateBlogInput.safeParse(body);
  // if (!success) {
  //   c.status(411);
  //   return c.json({
  //     message: "Invalid Inputs"
  //   })
  // }
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  console.log(body.published);

  const userId = c.get("userId")
  try {
    const blog = await prisma.post.update({
      where: {
        id: id,
        authorId: userId
      },
      data: {
        title: body.title,
        // content: body.content,
        published: body.published
      }
    })

    // Email function
    const resend = new Resend('your api');
    const receiver = "r1977sdausa@gmail.com" //body.email;

    try {
      const data = await resend.emails.send({
        from: 'ThoughtSphere@webmaven.tech',
        to: receiver,
        subject: '✏️ Blog Edited Successfully!',
        html: `
              <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
                <h2 style="color: #FFA500;">Blog Edited Successfully ✏️</h2>
                <p><b>Title:</b> ${body.title}</p>
                <p><b>Edited At:</b> ${new Date().toLocaleString()}</p>
                <p style="font-size: 0.9em; color: #555;">
                  Your changes have been saved successfully. You can review or publish your blog anytime.
                </p>
                <hr />
                <p style="font-size: 0.9em; color: #555;">
                  Need help? Feel free to <a href="mailto:ThoughtSphere@webmaven.tech" style="color: #FFA500;">contact us</a>.
                </p>
              </div>
            `
      });
      console.log(data);
    } catch (emailError) {
      console.error("Error sending email:", emailError);
    }

    return c.json({
      message: "Blog Updated Successfully",
      blog
    })
  } catch (error) {
    c.status(403);
    return c.json({
      message: "error upadting post"
    })
  }
});


blogRouter.get('/bulk', async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const posts = await prisma.post.findMany({
      where: {
        published: true
      },
      select: {
        content: true,
        title: true,
        id: true,
        published: true,
        createdAt: true,
        author: {
          select: {
            name: true
          }
        }
      }
    });
    return c.json(posts);
  } catch (error) {
    return c.json({
      message: "Error fetching the blog"
    })
  }
})


blogRouter.get("/:id", async (c) => {
  const id = c.req.param('id');
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const post = await prisma.post.findFirst({
      where: {
        id,
        // published: true
      },
      select: {
        id: true,
        title: true,
        content: true,
        published: true,
        author: {
          select: {
            name: true
          }
        }
      }
    });
    return c.json(post);
  } catch (error) {
    return c.json({
      message: "Error fetching the blog"
    })
  }
});


blogRouter.post('/myblog', async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  const userId = c.get('userId')

  try {
    const posts = await prisma.post.findMany({
      where: {
        authorId: userId
      },
      select: {
        content: true,
        title: true,
        id: true,
        published: true,
        createdAt: true,
        author: {
          select: {
            name: true
          }
        }
      }
    });
    return c.json(posts);
  } catch (error) {
    return c.json({
      message: "Error fetching the blog"
    })
  }
})


blogRouter.get('/search/:param?', async (c) => {
  const param = c.req.param('param') || 'a';
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  if (typeof param !== 'string') {
    c.status(400)
    return c.json({ message: 'Invalid query' });
  }

  try {
    const posts = await prisma.post.findMany({
      where: {
        OR: [     // OR is used to search in multiple feilds
          {
            title: {
              contains: param,
              mode: 'insensitive', // case-insensitive search
            },
          },
          // {
          //   content: {
          //     contains: param,
          //     mode: 'insensitive',
          //   },
          // },
        ],
      },
      select: {
        id: true,
        title: true,
        content: true,
        published: true,
        createdAt: true,
        author: {
          select: {
            name: true
          }
        }
      }
    });
    return c.json({
      message: "search success",
      posts
    });
  } catch (error) {
    console.error('Error searching posts:', error);
  }
})


blogRouter.delete("/:id", async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const post = await prisma.post.delete({
      where: {
        id
      },
    });
    // Email function
    const resend = new Resend('your api');
    const receiver = body.email;

    try {
      const data = await resend.emails.send({
        from: 'ThoughtSphere@webmaven.tech',
        to: receiver,
        subject: '🗑️ Blog Deleted Successfully',
        html: `
              <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
                <h2 style="color: #D32F2F;">Blog Deleted Successfully 🗑️</h2>
                <p><b>Deleted At:</b> ${new Date().toLocaleString()}</p>
                <p>Your blog has been removed from the platform.</p>
                <hr />
                <p style="font-size: 0.9em; color: #555;">
                  For further assistance, feel free to <a href="mailto:ThoughtSphere@webmaven.tech" style="color: #D32F2F;">contact our support team</a>.
                </p>
              </div>
            `
      });
      console.log(data);
    } catch (emailError) {
      console.error("Error sending email:", emailError);
    }
    return c.json(post);
  } catch (error) {
    return c.json({
      message: "Error fetching the blog"
    })
  }
});


blogRouter.post("/ai", async (c) => {
  try {
    // Check if Content-Type is application/json
    const contentType = c.req.header("Content-Type");
    if (!contentType || !contentType.includes("application/json")) {
      return c.json({ error: "Content-Type must be application/json" }, 400);
    }
    console.log(c.req.header);  // Log the headers to inspect

    // Try to parse the body as JSON
    let body;
    try {
      body = await c.req.json();
    } catch (error) {
      return c.json({ error: "Invalid JSON format" }, 400);
    }

    let { prompt } = body;

    if (!prompt) {
      return c.json({ error: "Prompt is required" }, 400);
    }

    const genAI = new GoogleGenerativeAI("your api");


    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const generateContent = async (prompt: string) => {
      try {
        const result = await model.generateContent(prompt);
        return result.response.text();
      } catch (error) {
        console.error("Error generating content:", error);
        throw error; // Re-throw the error for handling in other files
      }
    };
    const generatedContent = await generateContent(prompt);

    return c.json({ content: generatedContent });
  } catch (error) {
    console.error("Error in /ai route:", error);
    return c.json({ error: "Failed to generate content" }, 500);
  }
});


blogRouter.post("/summarize", async (c) => {
  try {
    // Check if Content-Type is application/json
    const contentType = c.req.header("Content-Type");
    if (!contentType || !contentType.includes("application/json")) {
      return c.json({ error: "Content-Type must be application/json" }, 400);
    }
    console.log(c.req.header);  // Log the headers to inspect

    // Try to parse the body as JSON
    let body;
    try {
      body = await c.req.json();
    } catch (error) {
      return c.json({ error: "Invalid JSON format" }, 400);
    }

    let { prompt } = body;
    prompt = prompt + " summarize using bulletpoints in 150 words use html tags and do not include ``` and html in response"

    if (!prompt) {
      return c.json({ error: "Prompt is required" }, 400);
    }

    const genAI = new GoogleGenerativeAI("your api");


    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const generateContent = async (prompt: string) => {
      try {
        const result = await model.generateContent(prompt);
        return result.response.text();
      } catch (error) {
        console.error("Error generating content:", error);
        throw error; // Re-throw the error for handling in other files
      }
    };
    const generatedContent = await generateContent(prompt);

    return c.json({ content: generatedContent });
  } catch (error) {
    console.error("Error in /ai route:", error);
    return c.json({ error: "Failed to generate content" }, 500);
  }
});