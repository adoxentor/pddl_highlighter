from setuptools import setup, find_packages

setup(
    name="pddl-highlighter",
    version="0.1.0",
    description="Custom Jupyter magic for PDDL code with syntax highlighting",
    long_description=open('README.md').read(),
    long_description_content_type='text/markdown',
    author="adoxentor",
    author_email="admin@adox.dev",
    url="https://github.com/adoxentor/pddl_highlighter",
    packages=find_packages(),
    include_package_data=True,
    install_requires=[
        "IPython>=7.0.0",
        "pygments>=2.4.0",
        "ipywidgets>=8.0.0",
    ],
    package_data={
        "pddl_highlighter": [
            "static/pddl.js",
        ],
    },
    python_requires=">=3.8",
    classifiers=[
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Framework :: Jupyter",
        "Framework :: Jupyter :: JupyterLab",
        "Intended Audience :: Science/Research",
        "Topic :: Scientific/Engineering :: Artificial Intelligence",
    ],
    keywords="pddl, jupyter, syntax highlighting, planning",
)
